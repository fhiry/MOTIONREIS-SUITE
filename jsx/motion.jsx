// Include utils
//@include "utils.jsx"

var motion = {
    // ---- 1. ANCHOR POINT ENGINE ----
    anchor: function(argsStr) {
        try {
            app.beginUndoGroup("Anchor Point Engine");
            var args = JSON.parse(argsStr);
            var action = args.action; 
            var compensate = args.comp === true;
            
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var rect = layer.sourceRectAtTime(comp.time, true); // true = include extents/masks
                var x = 0, y = 0;
                
                switch(action) {
                    case "TL": x = rect.left; y = rect.top; break;
                    case "TC": x = rect.left + rect.width/2; y = rect.top; break;
                    case "TR": x = rect.left + rect.width; y = rect.top; break;
                    case "ML": x = rect.left; y = rect.top + rect.height/2; break;
                    case "MC": x = rect.left + rect.width/2; y = rect.top + rect.height/2; break;
                    case "MR": x = rect.left + rect.width; y = rect.top + rect.height/2; break;
                    case "BL": x = rect.left; y = rect.top + rect.height; break;
                    case "BC": x = rect.left + rect.width/2; y = rect.top + rect.height; break;
                    case "BR": x = rect.left + rect.width; y = rect.top + rect.height; break;
                }
                
                var oldAnchor = layer.anchorPoint.value;
                var newAnchor = [x, y];
                if (layer.threeDLayer) {
                    newAnchor.push(oldAnchor.length > 2 ? oldAnchor[2] : 0);
                } else {
                    newAnchor.push(0);
                }
                
                if (compensate) {
                    // Helper function to convert local layer coordinates to composition coordinates in ExtendScript
                    function toCompExtendScript(lyr, localPt, t) {
                        var effGrp = lyr.property("ADBE Effect Folder");
                        if (!effGrp) return localPt;
                        var eff = effGrp.addProperty("ADBE Point 3D Control");
                        var ptProp = eff.property(1);
                        ptProp.expression = "toComp([" + localPt[0] + "," + localPt[1] + "," + (localPt.length > 2 ? localPt[2] : 0) + "])";
                        var res = ptProp.valueAtTime(t, true);
                        eff.remove();
                        return res;
                    }
                    
                    // Helper function to convert composition coordinates to local layer coordinates in ExtendScript
                    function fromCompExtendScript(lyr, compPt, t) {
                        var effGrp = lyr.property("ADBE Effect Folder");
                        if (!effGrp) return compPt;
                        var eff = effGrp.addProperty("ADBE Point 3D Control");
                        var ptProp = eff.property(1);
                        ptProp.expression = "fromComp([" + compPt[0] + "," + compPt[1] + "," + (compPt.length > 2 ? compPt[2] : 0) + "])";
                        var res = ptProp.valueAtTime(t, true);
                        eff.remove();
                        return res;
                    }

                    // Helper function to shift a single dimension property (with/without keyframes)
                    function shiftProperty(prop, diff) {
                        if (!prop) return;
                        if (prop.numKeys > 0) {
                            for (var k = 1; k <= prop.numKeys; k++) {
                                prop.setValueAtKey(k, prop.keyValue(k) + diff);
                            }
                        } else {
                            prop.setValue(prop.value + diff);
                        }
                    }
                    
                    // Helper function to shift multi-dimensional position (with/without keyframes)
                    function shiftPosition3D(prop, dx, dy, dz) {
                        if (prop.numKeys > 0) {
                            for (var k = 1; k <= prop.numKeys; k++) {
                                var val = prop.keyValue(k);
                                var newVal = [val[0] + dx, val[1] + dy];
                                if (val.length > 2) newVal.push(val[2] + dz);
                                prop.setValueAtKey(k, newVal);
                            }
                        } else {
                            var val = prop.value;
                            var newVal = [val[0] + dx, val[1] + dy];
                            if (val.length > 2) newVal.push(val[2] + dz);
                            prop.setValue(newVal);
                        }
                    }

                    // Get comp-space coordinates of the new anchor point before modifying it
                    var compPosOfNewAnchor = toCompExtendScript(layer, newAnchor, comp.time);
                    
                    // Convert comp-space coordinates to the parent layer's space if parented
                    var parentPosOfNewAnchor;
                    if (layer.parent) {
                        parentPosOfNewAnchor = fromCompExtendScript(layer.parent, compPosOfNewAnchor, comp.time);
                    } else {
                        parentPosOfNewAnchor = compPosOfNewAnchor;
                    }
                    
                    // Calculate the position difference vector in parent/comp space
                    var curPosVal = layer.position.value;
                    var dx = parentPosOfNewAnchor[0] - curPosVal[0];
                    var dy = parentPosOfNewAnchor[1] - curPosVal[1];
                    var dz = (parentPosOfNewAnchor.length > 2 && curPosVal.length > 2) ? (parentPosOfNewAnchor[2] - curPosVal[2]) : 0;
                    
                    var transformGroup = layer.property("ADBE Transform Group");
                    var posProp = transformGroup.property("ADBE Position");
                    
                    if (posProp.dimensionsSeparated) {
                        var xProp = transformGroup.property("ADBE Position_0");
                        var yProp = transformGroup.property("ADBE Position_1");
                        var zProp = transformGroup.property("ADBE Position_2");
                        
                        shiftProperty(xProp, dx);
                        shiftProperty(yProp, dy);
                        if (layer.threeDLayer) shiftProperty(zProp, dz);
                    } else {
                        shiftPosition3D(posProp, dx, dy, dz);
                    }
                    
                    layer.anchorPoint.setValue(newAnchor);
                } else {
                    layer.anchorPoint.setValue(newAnchor);
                }
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Anchor point moved to " + action);
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- 2. NULL SYNTHESIZER ----
    nullFromSelection: function(argsStr) {
        try {
            app.beginUndoGroup("Create Null");
            var args = argsStr ? JSON.parse(argsStr) : {};
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var is3D = (args.null3d === true);
            var centerX, centerY, centerZ = 0;
            
            if (layers.length > 0) {
                // Calculate average center of selected layers
                var minX = 99999, minY = 99999, maxX = -99999, maxY = -99999;
                var minZ = 99999, maxZ = -99999;
                
                for (var i = 0; i < layers.length; i++) {
                    var l = layers[i];
                    if (l.threeDLayer) is3D = true;
                    
                    var pos;
                    if (l.position.dimensionsSeparated) {
                        var px = l.property("ADBE Transform Group").property("ADBE Position_0").value;
                        var py = l.property("ADBE Transform Group").property("ADBE Position_1").value;
                        var pz = l.property("ADBE Transform Group").property("ADBE Position_2") ? l.property("ADBE Transform Group").property("ADBE Position_2").value : 0;
                        pos = [px, py, pz];
                    } else {
                        pos = l.position.value;
                    }
                    
                    if (pos[0] < minX) minX = pos[0];
                    if (pos[0] > maxX) maxX = pos[0];
                    if (pos[1] < minY) minY = pos[1];
                    if (pos[1] > maxY) maxY = pos[1];
                    
                    var zVal = pos.length > 2 ? pos[2] : 0;
                    if (zVal < minZ) minZ = zVal;
                    if (zVal > maxZ) maxZ = zVal;
                }
                
                centerX = (minX + maxX) / 2;
                centerY = (minY + maxY) / 2;
                centerZ = (minZ + maxZ) / 2;
            } else {
                // Default to comp center if no layers are selected
                centerX = comp.width / 2;
                centerY = comp.height / 2;
                centerZ = 0;
            }
            
            var nullLayer = comp.layers.addNull();
            nullLayer.name = "Controller Null";
            nullLayer.threeDLayer = is3D;
            nullLayer.position.setValue([centerX, centerY, is3D ? centerZ : 0]);
            nullLayer.label = 13; // Set to green color label
            
            // Trim Null to match selected layers' timing
            if (layers.length > 0) {
                var minIn = layers[0].inPoint;
                var maxOut = layers[0].outPoint;
                for (var i = 1; i < layers.length; i++) {
                    if (layers[i].inPoint < minIn) minIn = layers[i].inPoint;
                    if (layers[i].outPoint > maxOut) maxOut = layers[i].outPoint;
                }
                nullLayer.inPoint = minIn;
                nullLayer.outPoint = maxOut;
            }
            
            // Parent selected layers to the new Null
            if (layers.length > 0) {
                for (var i = 0; i < layers.length; i++) {
                    // Prevent self-parenting loops
                    if (layers[i] !== nullLayer) {
                        layers[i].parent = nullLayer;
                    }
                }
                
                // Move the Null layer to be directly above the first selected layer in the stacking order
                var topSelectedIndex = layers[0].index;
                for (var i = 1; i < layers.length; i++) {
                    if (layers[i].index < topSelectedIndex) {
                        topSelectedIndex = layers[i].index;
                    }
                }
                nullLayer.moveBefore(comp.layer(topSelectedIndex));
            }
            
            // Focus on the Null layer
            app.executeCommand(2004); // Deselect All
            nullLayer.selected = true;
            
            app.endUndoGroup();
            if (layers.length > 0) {
                return MotionreisUtils.sendResponse("Berhasil membuat Null di tengah seleksi (" + layers.length + " layer parented).");
            } else {
                return MotionreisUtils.sendResponse("Berhasil membuat Null di tengah komposisi.");
            }
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- 3. WIGGLE PRO ----
    applyWiggle: function(args) {
        try {
            app.beginUndoGroup("Wiggle Pro");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var expr = "";
            if (args.loop) {
                expr = "var freq = " + args.freq + ";\n" +
                       "var amp = " + args.amp + ";\n" +
                       "var loopTime = 3;\n" +
                       "var t = time % loopTime;\n" +
                       "var w1 = wiggle(freq, amp, 1, 0.5, t);\n" +
                       "var w2 = wiggle(freq, amp, 1, 0.5, t - loopTime);\n" +
                       "linear(t, 0, loopTime, w1, w2);";
            } else {
                expr = "wiggle(" + args.freq + ", " + args.amp + ");";
            }
            
            var count = 0;
            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var j = 0; j < props.length; j++) {
                    if (props[j].canSetExpression) {
                        var cur = props[j].expression;
                        props[j].expression = (cur && cur !== "") ? cur + (cur.charAt(cur.length-1) === ';' ? '\n' : ';\n') + expr : expr;
                        count++;
                    }
                }
            }
            
            app.endUndoGroup();
            if (count === 0) return MotionreisUtils.sendError("Select a property (e.g., Position, Scale) to apply expression.");
            return MotionreisUtils.sendResponse("Wiggle (" + args.freq + ", " + args.amp + ") applied to " + count + " properties.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- 4. EASING LIBRARY ----
    applyEase: function(args) {
        try {
            app.beginUndoGroup("Easing Library");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            // Map preset string to influence values
            // In AE, influence is array: [speed, influence]
            var easeIn = new KeyframeEase(0, 33);
            var easeOut = new KeyframeEase(0, 33);
            
            if (args.preset === "linear") { easeIn = new KeyframeEase(0, 0.1); easeOut = new KeyframeEase(0, 0.1); }
            else if (args.preset === "easeIn") { easeIn = new KeyframeEase(0, 100); easeOut = new KeyframeEase(0, 0.1); }
            else if (args.preset === "easeOut") { easeIn = new KeyframeEase(0, 0.1); easeOut = new KeyframeEase(0, 100); }
            else if (args.preset === "expo") { easeIn = new KeyframeEase(0, 100); easeOut = new KeyframeEase(0, 100); }
            else if (args.preset === "snap") { easeIn = new KeyframeEase(0, 0.1); easeOut = new KeyframeEase(0, 100); }
            else { easeIn = new KeyframeEase(0, 33); easeOut = new KeyframeEase(0, 33); } // Default ease
            
            var count = 0;
            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (prop.canVaryOverTime && prop.selectedKeys.length > 0) {
                        for (var k = 0; k < prop.selectedKeys.length; k++) {
                            var keyIdx = prop.selectedKeys[k];
                            
                            // Determine dimension count
                            var easeInArr = [], easeOutArr = [];
                            var dims = prop.keyInTemporalEase(keyIdx).length;
                            
                            for (var d = 0; d < dims; d++) {
                                easeInArr.push(easeIn);
                                easeOutArr.push(easeOut);
                            }
                            
                            var isFirst = (k === 0);
                            var isLast = (k === prop.selectedKeys.length - 1);
                            var applyIn = false, applyOut = false;
                            
                            if (args.action === "applyEaseBoth") {
                                if (prop.selectedKeys.length === 1) {
                                    applyIn = true; applyOut = true;
                                } else {
                                    if (isFirst) { applyOut = true; }
                                    else if (isLast) { applyIn = true; }
                                    else { applyIn = true; applyOut = true; }
                                }
                            } else if (args.action === "applyEaseIn") { applyIn = true; }
                            else if (args.action === "applyEaseOut") { applyOut = true; }
                            
                            var finalIn = applyIn ? easeInArr : prop.keyInTemporalEase(keyIdx);
                            var finalOut = applyOut ? easeOutArr : prop.keyOutTemporalEase(keyIdx);
                            prop.setTemporalEaseAtKey(keyIdx, finalIn, finalOut);
                            count++;
                        }
                    }
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Easing " + args.preset + " diterapkan ke " + count + " keyframes.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- 5. STAGGER & OFFSET ----
    staggerLayers: function(args) {
        try {
            app.beginUndoGroup("Stagger Layers");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var frames = parseFloat(args.frames);
            var offsetTime = frames * comp.frameDuration;
            
            // Sort layers based on mode
            var sortedLayers = layers.slice();
            if (args.mode === "desc") {
                sortedLayers.reverse();
            } else if (args.mode === "random") {
                sortedLayers.sort(function() { return 0.5 - Math.random() });
            }
            
            for (var i = 0; i < sortedLayers.length; i++) {
                sortedLayers[i].startTime += (i * offsetTime);
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully staggered " + layers.length + " layers.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    staggerKeys: function(args) {
        try {
            app.beginUndoGroup("Stagger Keyframes");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);

            var frames = parseFloat(args.frames || 2);
            var offsetTime = frames * comp.frameDuration;
            var count = 0;

            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (!prop.canVaryOverTime || prop.numKeys === 0) continue;
                    
                    // Determine which keys to stagger (selective staggering support)
                    var keysToStagger = [];
                    if (prop.selectedKeys.length > 0) {
                        for (var k = 0; k < prop.selectedKeys.length; k++) {
                            keysToStagger.push(prop.selectedKeys[k]);
                        }
                    } else {
                        for (var k = 1; k <= prop.numKeys; k++) {
                            keysToStagger.push(k);
                        }
                    }
                    
                    var shift = i * offsetTime;
                    if (shift === 0) {
                        count++;
                        continue; // No shift needed for the first layer, but it counts as processed!
                    }
                    
                    // Collect keyframe data for the target keys before removing them
                    var keysData = [];
                    for (var k = 0; k < keysToStagger.length; k++) {
                        var kIdx = keysToStagger[k];
                        var isSpatial = (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL);
                        
                        keysData.push({
                            oldIndex: kIdx,
                            time: prop.keyTime(kIdx) + shift,
                            value: prop.keyValue(kIdx),
                            inType: prop.keyInInterpolationType(kIdx),
                            outType: prop.keyOutInterpolationType(kIdx),
                            inEase: (prop.keyInInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER || prop.keyOutInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER) ? prop.keyInTemporalEase(kIdx) : null,
                            outEase: (prop.keyInInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER || prop.keyOutInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER) ? prop.keyOutTemporalEase(kIdx) : null,
                            isSpatial: isSpatial,
                            inTangent: isSpatial ? prop.keyInSpatialTangent(kIdx) : null,
                            outTangent: isSpatial ? prop.keyOutSpatialTangent(kIdx) : null,
                            spatialAutoBezier: isSpatial ? prop.keySpatialAutoBezier(kIdx) : false,
                            spatialContinuous: isSpatial ? prop.keySpatialContinuous(kIdx) : false,
                            temporalContinuous: prop.keyTemporalContinuous(kIdx)
                        });
                    }
                    
                    // Remove old keyframes in reverse order to prevent index shifting
                    keysToStagger.sort(function(a, b) { return b - a; });
                    for (var k = 0; k < keysToStagger.length; k++) {
                        prop.removeKey(keysToStagger[k]);
                    }
                    
                    // Write back keyframes at new times with perfect ease/curve preservation!
                    var newKeyIndices = [];
                    for (var k = 0; k < keysData.length; k++) {
                        var data = keysData[k];
                        var newIdx = prop.addKey(data.time);
                        prop.setValueAtKey(newIdx, data.value);
                        
                        prop.setInterpolationTypeAtKey(newIdx, data.inType, data.outType);
                        
                        if (data.inEase && data.outEase) {
                            prop.setTemporalEaseAtKey(newIdx, data.inEase, data.outEase);
                        }
                        
                        if (data.isSpatial) {
                            prop.setSpatialTangentsAtKey(newIdx, data.inTangent, data.outTangent);
                            prop.setSpatialAutoBezierAtKey(newIdx, data.spatialAutoBezier);
                            prop.setSpatialContinuousAtKey(newIdx, data.spatialContinuous);
                        }
                        
                        prop.setTemporalContinuousAtKey(newIdx, data.temporalContinuous);
                        newKeyIndices.push(newIdx);
                    }
                    
                    // Reselect the newly staggered keyframes
                    for (var nk = 0; nk < newKeyIndices.length; nk++) {
                        prop.setSelectedAtKey(newKeyIndices[nk], true);
                    }
                    
                    count++;
                }
            }

            app.endUndoGroup();
            if (count === 0) return MotionreisUtils.sendError("Select a property with keyframes to stagger.");
            return MotionreisUtils.sendResponse("Successfully staggered keyframes pada " + count + " properties.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    copyEase: function() {
        try {
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var copiedData = null;
            
            // Find the first selected keyframes
            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (prop.canVaryOverTime && prop.selectedKeys.length > 0) {
                        var k = prop.selectedKeys[0];
                        
                        // We only copy the first dimension's ease, as EaseCopy usually applies one curve
                        var inEase = prop.keyInTemporalEase(k)[0];
                        var outEase = prop.keyOutTemporalEase(k)[0];
                        
                        copiedData = {
                            inSpeed: inEase.speed,
                            inInfluence: inEase.influence,
                            outSpeed: outEase.speed,
                            outInfluence: outEase.influence,
                            inInterp: prop.keyInInterpolationType(k),
                            outInterp: prop.keyOutInterpolationType(k)
                        };
                        break;
                    }
                }
                if (copiedData) break;
            }
            
            if (!copiedData) return MotionreisUtils.sendError("Please select at least 1 keyframes to copy ease.");
            
            // Save to AE Settings so it persists across script runs
            app.settings.saveSetting("Motionreis", "CopiedEase", JSON.stringify(copiedData));
            
            return MotionreisUtils.sendResponse("Successfully copied keyframes velocity graph!");
        } catch(e) {
            return MotionreisUtils.sendError(e.message);
        }
    },
    
    pasteEase: function() {
        try {
            app.beginUndoGroup("Paste Ease");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            if (!app.settings.haveSetting("Motionreis", "CopiedEase")) {
                return MotionreisUtils.sendError("Belum ada ease yang di-copy. Copy dulu bro!");
            }
            
            var copiedData = JSON.parse(app.settings.getSetting("Motionreis", "CopiedEase"));
            
            var easeIn = new KeyframeEase(copiedData.inSpeed, copiedData.inInfluence);
            var easeOut = new KeyframeEase(copiedData.outSpeed, copiedData.outInfluence);
            var count = 0;
            
            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (prop.canVaryOverTime && prop.selectedKeys.length > 0) {
                        for (var k = 0; k < prop.selectedKeys.length; k++) {
                            var keyIdx = prop.selectedKeys[k];
                            
                            // Determine dimension count
                            var easeInArr = [], easeOutArr = [];
                            var dims = prop.keyInTemporalEase(keyIdx).length;
                            
                            for (var d = 0; d < dims; d++) {
                                easeInArr.push(easeIn);
                                easeOutArr.push(easeOut);
                            }
                            
                            // Paste Ease and Interpolation
                            prop.setInterpolationTypeAtKey(keyIdx, copiedData.inInterp, copiedData.outInterp);
                            prop.setTemporalEaseAtKey(keyIdx, easeInArr, easeOutArr);
                            count++;
                        }
                    }
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully pasted Ease to " + count + " keyframes.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- KEYFRAME WINGMAN ----
    // Apply ease via influence sliders (0-100%). mode: 'in', 'out', 'both'
    applyEaseSlider: function(args) {
        try {
            app.beginUndoGroup("Keyframes Wingman");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var easeIn  = parseFloat(args.easeIn  || 0);
            var easeOut = parseFloat(args.easeOut || 0);
            var mode    = args.mode || 'both'; // 'in', 'out', 'both'
            
            easeIn = Math.max(0.1, Math.min(100, easeIn));
            easeOut = Math.max(0.1, Math.min(100, easeOut));
            
            var count = 0;

            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (!prop.canVaryOverTime || prop.selectedKeys.length === 0) continue;
                    for (var k = 0; k < prop.selectedKeys.length; k++) {
                        var keyIdx = prop.selectedKeys[k];
                        var curIn  = prop.keyInTemporalEase(keyIdx);
                        var curOut = prop.keyOutTemporalEase(keyIdx);
                        var newIn  = [], newOut = [];
                        for (var d = 0; d < curIn.length; d++) {
                            newIn.push(new KeyframeEase(0,
                                (mode === 'out') ? curIn[d].influence : easeIn));
                            newOut.push(new KeyframeEase(0,
                                (mode === 'in')  ? curOut[d].influence : easeOut));
                        }
                        var isFirst = (k === 0);
                        var isLast = (k === prop.selectedKeys.length - 1);
                        var applyIn = false, applyOut = false;
                        
                        if (mode === 'both') {
                            if (prop.selectedKeys.length === 1) {
                                applyIn = true; applyOut = true;
                            } else {
                                if (isFirst) { applyOut = true; }
                                else if (isLast) { applyIn = true; }
                                else { applyIn = true; applyOut = true; }
                            }
                        } else if (mode === 'in') { applyIn = true; }
                        else if (mode === 'out') { applyOut = true; }

                        var finalIn = applyIn ? newIn : curIn;
                        var finalOut = applyOut ? newOut : curOut;
                        prop.setTemporalEaseAtKey(keyIdx, finalIn, finalOut);
                        count++;
                    }
                }
            }
            app.endUndoGroup();
            if (count === 0) return MotionreisUtils.sendError("Pilih keyframes dulu.");
            return MotionreisUtils.sendResponse("Ease slider applied to " + count + " keyframes.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    getRawEaseData: function() {
        try {
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var copiedData = null;
            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (prop.canVaryOverTime && prop.selectedKeys.length > 0) {
                        var k1 = prop.selectedKeys[0];
                        var k2 = prop.selectedKeys.length > 1 ? prop.selectedKeys[1] : k1;
                        
                        var outEase = prop.keyOutTemporalEase(k1)[0];
                        var inEase = prop.keyInTemporalEase(k2)[0];
                        
                        copiedData = {
                            inSpeed: inEase.speed,
                            inInfluence: inEase.influence,
                            outSpeed: outEase.speed,
                            outInfluence: outEase.influence,
                            inInterp: prop.keyInInterpolationType(k2),
                            outInterp: prop.keyOutInterpolationType(k1)
                        };
                        break;
                    }
                }
                if (copiedData) break;
            }
            
            if (!copiedData) return MotionreisUtils.sendError("Select keyframes to save graph.");
            return MotionreisUtils.sendResponse(copiedData);
        } catch(e) {
            return MotionreisUtils.sendError(e.message);
        }
    },

    applyRawEase: function(args) {
        try {
            app.beginUndoGroup("Library Preset Ease");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var rawData = JSON.parse(args.rawData);
            
            var easeIn = new KeyframeEase(rawData.inSpeed, rawData.inInfluence);
            var easeOut = new KeyframeEase(rawData.outSpeed, rawData.outInfluence);
            var count = 0;
            
            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (prop.canVaryOverTime && prop.selectedKeys.length > 0) {
                        for (var k = 0; k < prop.selectedKeys.length; k++) {
                            var keyIdx = prop.selectedKeys[k];
                            
                            var easeInArr = [], easeOutArr = [];
                            var dims = prop.keyInTemporalEase(keyIdx).length;
                            
                            for (var d = 0; d < dims; d++) {
                                easeInArr.push(easeIn);
                                easeOutArr.push(easeOut);
                            }
                            
                            var isFirst = (k === 0);
                            var isLast = (k === prop.selectedKeys.length - 1);
                            var applyIn = false, applyOut = false;
                            
                            if (prop.selectedKeys.length === 1) {
                                applyIn = true; applyOut = true;
                            } else {
                                if (isFirst) { applyOut = true; }
                                else if (isLast) { applyIn = true; }
                                else { applyIn = true; applyOut = true; }
                            }
                            
                            var curIn = prop.keyInTemporalEase(keyIdx);
                            var curOut = prop.keyOutTemporalEase(keyIdx);
                            
                            var finalIn = applyIn ? easeInArr : curIn;
                            var finalOut = applyOut ? easeOutArr : curOut;
                            
                            prop.setInterpolationTypeAtKey(keyIdx, 
                                applyIn ? rawData.inInterp : prop.keyInInterpolationType(keyIdx), 
                                applyOut ? rawData.outInterp : prop.keyOutInterpolationType(keyIdx)
                            );
                            prop.setTemporalEaseAtKey(keyIdx, finalIn, finalOut);
                            count++;
                        }
                    }
                }
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Raw ease applied to " + count + " keyframes.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // ---- KEYFRAME ACTIONS ----

    // Mirror: reflect keyframes values around playhead
    // Mirror: reflect keyframes values around playhead, swapping and flipping bezier curves perfectly
    mirrorKeys: function() {
        try {
            app.beginUndoGroup("Mirror Keyframes");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var pivot = comp.time;
            var count = 0;

            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (!prop.canVaryOverTime || prop.selectedKeys.length < 1) continue;
                    
                    var keys = prop.selectedKeys;
                    var numKeys = keys.length;
                    
                    // Collect all properties of selected keys before creating new keys
                    var keysData = [];
                    for (var k = 0; k < numKeys; k++) {
                        var kIdx = keys[k];
                        var isSpatial = (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL);
                        
                        keysData.push({
                            time: 2 * pivot - prop.keyTime(kIdx),
                            value: prop.keyValue(kIdx),
                            inType: prop.keyInInterpolationType(kIdx),
                            outType: prop.keyOutInterpolationType(kIdx),
                            inEase: (prop.keyInInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER || prop.keyOutInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER) ? prop.keyInTemporalEase(kIdx) : null,
                            outEase: (prop.keyInInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER || prop.keyOutInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER) ? prop.keyOutTemporalEase(kIdx) : null,
                            isSpatial: isSpatial,
                            inTangent: isSpatial ? prop.keyInSpatialTangent(kIdx) : null,
                            outTangent: isSpatial ? prop.keyOutSpatialTangent(kIdx) : null,
                            spatialAutoBezier: isSpatial ? prop.keySpatialAutoBezier(kIdx) : false,
                            spatialContinuous: isSpatial ? prop.keySpatialContinuous(kIdx) : false,
                            temporalContinuous: prop.keyTemporalContinuous(kIdx)
                        });
                    }
                    
                    // Create mirrored keys (reverse order to ensure indices don't shift unpredictably)
                    for (var k = keysData.length - 1; k >= 0; k--) {
                        var data = keysData[k];
                        if (data.time >= 0 && data.time <= comp.duration) {
                            var newIdx = prop.addKey(data.time);
                            prop.setValueAtKey(newIdx, data.value);
                            
                            // Since time is mirrored (reversed flow), we swap and negate properties
                            prop.setInterpolationTypeAtKey(newIdx, data.outType, data.inType);
                            
                            if (data.outEase && data.inEase) {
                                prop.setTemporalEaseAtKey(newIdx, data.outEase, data.inEase);
                            }
                            
                            if (data.isSpatial) {
                                var negInTangent = [];
                                for (var d = 0; d < data.inTangent.length; d++) negInTangent.push(-data.inTangent[d]);
                                var negOutTangent = [];
                                for (var d = 0; d < data.outTangent.length; d++) negOutTangent.push(-data.outTangent[d]);
                                
                                prop.setSpatialTangentsAtKey(newIdx, negOutTangent, negInTangent);
                                prop.setSpatialAutoBezierAtKey(newIdx, data.spatialAutoBezier);
                                prop.setSpatialContinuousAtKey(newIdx, data.spatialContinuous);
                            }
                            
                            prop.setTemporalContinuousAtKey(newIdx, data.temporalContinuous);
                            count++;
                        }
                    }
                }
            }
            app.endUndoGroup();
            if (count === 0) return MotionreisUtils.sendError("Pilih keyframes dan posisikan playhead di titik mirror.");
            return MotionreisUtils.sendResponse("Successfully mirrored " + count + " keyframes at playhead.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // Time-reverse helper that performs the actual keyframe reversing action
    reverseKeysAction: function() {
        var comp = MotionreisUtils.getActiveComp();
        var layers = MotionreisUtils.getSelectedLayers(comp);
        var count = 0;

        for (var i = 0; i < layers.length; i++) {
            var props = layers[i].selectedProperties;
            for (var p = 0; p < props.length; p++) {
                var prop = props[p];
                if (!prop.canVaryOverTime || prop.selectedKeys.length < 2) continue;
                
                var keys = prop.selectedKeys;
                var numKeys = keys.length;
                
                // Collect all times and properties of selected keys
                var keysData = [];
                for (var k = 0; k < numKeys; k++) {
                    var kIdx = keys[k];
                    var isSpatial = (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL);
                    
                    keysData.push({
                        time: prop.keyTime(kIdx),
                        value: prop.keyValue(kIdx),
                        inType: prop.keyInInterpolationType(kIdx),
                        outType: prop.keyOutInterpolationType(kIdx),
                        inEase: (prop.keyInInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER || prop.keyOutInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER) ? prop.keyInTemporalEase(kIdx) : null,
                        outEase: (prop.keyInInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER || prop.keyOutInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER) ? prop.keyOutTemporalEase(kIdx) : null,
                        isSpatial: isSpatial,
                        inTangent: isSpatial ? prop.keyInSpatialTangent(kIdx) : null,
                        outTangent: isSpatial ? prop.keyOutSpatialTangent(kIdx) : null,
                        spatialAutoBezier: isSpatial ? prop.keySpatialAutoBezier(kIdx) : false,
                        spatialContinuous: isSpatial ? prop.keySpatialContinuous(kIdx) : false,
                        temporalContinuous: prop.keyTemporalContinuous(kIdx)
                    });
                }
                
                // Write back properties in reverse order
                for (var k = 0; k < numKeys; k++) {
                    var targetIdx = keys[k];
                    var data = keysData[numKeys - 1 - k]; // Source data from the mirrored keyframe
                    
                    prop.setValueAtKey(targetIdx, data.value);
                    
                    // Set swapped interpolation types
                    prop.setInterpolationTypeAtKey(targetIdx, data.outType, data.inType);
                    
                    // Set swapped eases
                    if (data.outEase && data.inEase) {
                        prop.setTemporalEaseAtKey(targetIdx, data.outEase, data.inEase);
                    }
                    
                    // Set swapped & negated spatial tangents
                    if (data.isSpatial) {
                        var negInTangent = [];
                        for (var d = 0; d < data.inTangent.length; d++) negInTangent.push(-data.inTangent[d]);
                        var negOutTangent = [];
                        for (var d = 0; d < data.outTangent.length; d++) negOutTangent.push(-data.outTangent[d]);
                        
                        prop.setSpatialTangentsAtKey(targetIdx, negOutTangent, negInTangent);
                        prop.setSpatialAutoBezierAtKey(targetIdx, data.spatialAutoBezier);
                        prop.setSpatialContinuousAtKey(targetIdx, data.spatialContinuous);
                    }
                    
                    prop.setTemporalContinuousAtKey(targetIdx, data.temporalContinuous);
                }
                count += numKeys;
            }
        }
        return count;
    },

    // Context-sensitive Reverse: Reverses selected keyframes curves, OR reverses selected layers timeline stacking order!
    reverseKeys: function() {
        try {
            app.beginUndoGroup("Reverse Selection");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            // Check if there are selected keyframes
            var hasSelectedKeys = false;
            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    if (props[p].canVaryOverTime && props[p].selectedKeys.length > 0) {
                        hasSelectedKeys = true;
                        break;
                    }
                }
                if (hasSelectedKeys) break;
            }
            
            if (hasSelectedKeys) {
                var keyCount = this.reverseKeysAction();
                app.endUndoGroup();
                if (keyCount === 0) return MotionreisUtils.sendError("Pilih minimal 2 keyframes.");
                return MotionreisUtils.sendResponse("Successfully reversed " + keyCount + " keyframes.");
            } else if (layers.length >= 2) {
                // Reverse layer stacking order
                var sorted = [];
                for (var i = 0; i < layers.length; i++) {
                    sorted.push(layers[i]);
                }
                sorted.sort(function(a, b) { return a.index - b.index; });
                
                for (var i = 1; i < sorted.length; i++) {
                    sorted[i].moveBefore(sorted[i-1]);
                }
                
                app.endUndoGroup();
                return MotionreisUtils.sendResponse("Successfully reversed order of " + layers.length + " layers.");
            } else {
                app.endUndoGroup();
                return MotionreisUtils.sendError("Pilih minimal 2 keyframes atau 2 layer untuk membalik urutan.");
            }
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // Context-sensitive Clone: Clones selected keyframes curves to playhead, OR duplicates selected layers!
    cloneKeys: function() {
        try {
            app.beginUndoGroup("Clone Selection");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            // Check if there are selected keyframes
            var hasSelectedKeys = false;
            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    if (props[p].canVaryOverTime && props[p].selectedKeys.length > 0) {
                        hasSelectedKeys = true;
                        break;
                    }
                }
                if (hasSelectedKeys) break;
            }
            
            if (hasSelectedKeys) {
                var playhead = comp.time;
                var count = 0;
                
                for (var i = 0; i < layers.length; i++) {
                    var props = layers[i].selectedProperties;
                    for (var p = 0; p < props.length; p++) {
                        var prop = props[p];
                        if (!prop.canVaryOverTime || prop.selectedKeys.length < 1) continue;
                        
                        var keys = prop.selectedKeys;
                        var firstKeyTime = prop.keyTime(keys[0]);
                        var offset = playhead - firstKeyTime;
                        
                        // Collect all properties of selected keys before creating new keys
                        var keysData = [];
                        for (var k = 0; k < keys.length; k++) {
                            var kIdx = keys[k];
                            var isSpatial = (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL);
                            
                            keysData.push({
                                time: prop.keyTime(kIdx) + offset,
                                value: prop.keyValue(kIdx),
                                inType: prop.keyInInterpolationType(kIdx),
                                outType: prop.keyOutInterpolationType(kIdx),
                                inEase: (prop.keyInInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER || prop.keyOutInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER) ? prop.keyInTemporalEase(kIdx) : null,
                                outEase: (prop.keyInInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER || prop.keyOutInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER) ? prop.keyOutTemporalEase(kIdx) : null,
                                isSpatial: isSpatial,
                                inTangent: isSpatial ? prop.keyInSpatialTangent(kIdx) : null,
                                outTangent: isSpatial ? prop.keyOutSpatialTangent(kIdx) : null,
                                spatialAutoBezier: isSpatial ? prop.keySpatialAutoBezier(kIdx) : false,
                                spatialContinuous: isSpatial ? prop.keySpatialContinuous(kIdx) : false,
                                temporalContinuous: prop.keyTemporalContinuous(kIdx)
                            });
                        }
                        
                        // Create duplicate keys
                        for (var k = 0; k < keysData.length; k++) {
                            var data = keysData[k];
                            if (data.time >= 0 && data.time <= comp.duration) {
                                var newIdx = prop.addKey(data.time);
                                prop.setValueAtKey(newIdx, data.value);
                                
                                prop.setInterpolationTypeAtKey(newIdx, data.inType, data.outType);
                                
                                if (data.inEase && data.outEase) {
                                    prop.setTemporalEaseAtKey(newIdx, data.inEase, data.outEase);
                                }
                                
                                if (data.isSpatial) {
                                    prop.setSpatialTangentsAtKey(newIdx, data.inTangent, data.outTangent);
                                    prop.setSpatialAutoBezierAtKey(newIdx, data.spatialAutoBezier);
                                    prop.setSpatialContinuousAtKey(newIdx, data.spatialContinuous);
                                }
                                
                                prop.setTemporalContinuousAtKey(newIdx, data.temporalContinuous);
                                count++;
                            }
                        }
                    }
                }
                app.endUndoGroup();
                if (count === 0) return MotionreisUtils.sendError("Pilih keyframes dulu, lalu posisikan playhead.");
                return MotionreisUtils.sendResponse("Successfully cloned " + count + " keyframes to playhead.");
            } else if (layers.length > 0) {
                // Duplicate selected layers
                var newLayers = [];
                for (var i = 0; i < layers.length; i++) {
                    var dup = layers[i].duplicate();
                    newLayers.push(dup);
                }
                
                // Deselect all, then select the new duplicates
                app.executeCommand(2004); 
                for (var n = 0; n < newLayers.length; n++) {
                    newLayers[n].selected = true;
                }
                
                app.endUndoGroup();
                return MotionreisUtils.sendResponse("Successfully duplicated " + layers.length + " layers.");
            } else {
                app.endUndoGroup();
                return MotionreisUtils.sendError("Pilih keyframes atau layer untuk dikloning.");
            }
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // Easing-safe and spatial tangent-preserving Shift Keyframes
    shiftKeys: function(args) {
        try {
            app.beginUndoGroup("Shift Keyframes");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var frames = parseFloat(args.frames || 0);
            var offsetTime = frames * comp.frameDuration;
            var count = 0;

            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (!prop.canVaryOverTime || prop.selectedKeys.length < 1) continue;
                    
                    var keys = prop.selectedKeys;
                    var numKeys = keys.length;
                    
                    // Collect keyframe data before removing
                    var keysData = [];
                    for (var k = 0; k < numKeys; k++) {
                        var kIdx = keys[k];
                        var isSpatial = (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL);
                        
                        keysData.push({
                            time: prop.keyTime(kIdx) + offsetTime,
                            value: prop.keyValue(kIdx),
                            inType: prop.keyInInterpolationType(kIdx),
                            outType: prop.keyOutInterpolationType(kIdx),
                            inEase: (prop.keyInInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER || prop.keyOutInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER) ? prop.keyInTemporalEase(kIdx) : null,
                            outEase: (prop.keyInInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER || prop.keyOutInterpolationType(kIdx) === KeyframeInterpolationType.BEZIER) ? prop.keyOutTemporalEase(kIdx) : null,
                            isSpatial: isSpatial,
                            inTangent: isSpatial ? prop.keyInSpatialTangent(kIdx) : null,
                            outTangent: isSpatial ? prop.keyOutSpatialTangent(kIdx) : null,
                            spatialAutoBezier: isSpatial ? prop.keySpatialAutoBezier(kIdx) : false,
                            spatialContinuous: isSpatial ? prop.keySpatialContinuous(kIdx) : false,
                            temporalContinuous: prop.keyTemporalContinuous(kIdx)
                        });
                    }
                    
                    // Remove old keyframes in reverse order
                    var sortedKeys = [];
                    for (var k = 0; k < numKeys; k++) sortedKeys.push(keys[k]);
                    sortedKeys.sort(function(a, b) { return b - a; });
                    for (var k = 0; k < sortedKeys.length; k++) {
                        prop.removeKey(sortedKeys[k]);
                    }
                    
                    // Write back keyframes
                    var newKeyIndices = [];
                    for (var k = 0; k < keysData.length; k++) {
                        var data = keysData[k];
                        if (data.time >= 0 && data.time <= comp.duration) {
                            var newIdx = prop.addKey(data.time);
                            prop.setValueAtKey(newIdx, data.value);
                            
                            prop.setInterpolationTypeAtKey(newIdx, data.inType, data.outType);
                            
                            if (data.inEase && data.outEase) {
                                prop.setTemporalEaseAtKey(newIdx, data.inEase, data.outEase);
                            }
                            
                            if (data.isSpatial) {
                                prop.setSpatialTangentsAtKey(newIdx, data.inTangent, data.outTangent);
                                prop.setSpatialAutoBezierAtKey(newIdx, data.spatialAutoBezier);
                                prop.setSpatialContinuousAtKey(newIdx, data.spatialContinuous);
                            }
                            
                            prop.setTemporalContinuousAtKey(newIdx, data.temporalContinuous);
                            newKeyIndices.push(newIdx);
                            count++;
                        }
                    }
                    
                    // Reselect shifted keyframes
                    for (var nk = 0; nk < newKeyIndices.length; nk++) {
                        prop.setSelectedAtKey(newKeyIndices[nk], true);
                    }
                }
            }
            app.endUndoGroup();
            if (count === 0) return MotionreisUtils.sendError("Pilih keyframes terlebih dahulu.");
            return MotionreisUtils.sendResponse("Successfully shifted " + count + " keyframes.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // Align keyframes to playhead (alignTo: 'first' or 'last')
    alignKeys: function(args) {
        try {
            app.beginUndoGroup("Align Keyframes");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var playhead = comp.time;
            var alignTo = args.alignTo || 'first';
            var count = 0;

            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (!prop.canVaryOverTime || prop.selectedKeys.length < 1) continue;
                    var keys = prop.selectedKeys;
                    var refTime = (alignTo === 'last') ? prop.keyTime(keys[keys.length - 1]) : prop.keyTime(keys[0]);
                    var offset = playhead - refTime;
                    if (offset === 0) continue;
                    // Collect, remove, re-add shifted
                    var keyData = [];
                    for (var k = 0; k < keys.length; k++) {
                        keyData.push({ time: prop.keyTime(keys[k]) + offset, value: prop.keyValue(keys[k]) });
                    }
                    for (var k = keys.length - 1; k >= 0; k--) prop.removeKey(keys[k]);
                    for (var k = 0; k < keyData.length; k++) {
                        var t = keyData[k].time;
                        if (t >= 0 && t <= comp.duration) {
                            prop.addKey(t);
                            prop.setValueAtKey(prop.nearestKeyIndex(t), keyData[k].value);
                            count++;
                        }
                    }
                }
            }
            app.endUndoGroup();
            if (count === 0) return MotionreisUtils.sendError("Pilih keyframes, lalu posisikan playhead.");
            return MotionreisUtils.sendResponse("Successfully aligned " + count + " keyframes to playhead (" + alignTo + ").");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // Randomize keyframes timing
    randomizeKeys: function(args) {
        try {
            app.beginUndoGroup("Randomize Keyframes");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var maxOffset = parseFloat(args.maxOffset || 2) * comp.frameDuration;
            var count = 0;

            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (!prop.canVaryOverTime || prop.selectedKeys.length < 1) continue;
                    var keys = prop.selectedKeys;
                    var keyData = [];
                    for (var k = 0; k < keys.length; k++) {
                        var rnd = (Math.random() * 2 - 1) * maxOffset;
                        keyData.push({ time: prop.keyTime(keys[k]) + rnd, value: prop.keyValue(keys[k]) });
                    }
                    for (var k = keys.length - 1; k >= 0; k--) prop.removeKey(keys[k]);
                    for (var k = 0; k < keyData.length; k++) {
                        var t = keyData[k].time;
                        t = Math.max(0, Math.min(comp.duration, t));
                        prop.addKey(t);
                        prop.setValueAtKey(prop.nearestKeyIndex(t), keyData[k].value);
                        count++;
                    }
                }
            }
            app.endUndoGroup();
            if (count === 0) return MotionreisUtils.sendError("Pilih keyframes dulu.");
            return MotionreisUtils.sendResponse("Successfully randomized " + count + " keyframes timing.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // Snap sub-frame keyframes to the nearest whole frame (Fix Sub-frames)
    snapKeys: function() {
        try {
            app.beginUndoGroup("Snap Keyframes to Frames");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var fd = comp.frameDuration;
            var count = 0;
            
            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (!prop.canVaryOverTime || prop.selectedKeys.length < 1) continue;
                    
                    var keys = prop.selectedKeys;
                    var keyData = [];
                    
                    for (var k = 0; k < keys.length; k++) {
                        var ki = keys[k];
                        var t = prop.keyTime(ki);
                        var frame = Math.round(t / fd);
                        var roundedTime = frame * fd;
                        
                        keyData.push({
                            oldTime: t,
                            newTime: roundedTime,
                            value: prop.keyValue(ki),
                            inInterp: prop.keyInInterpolationType(ki),
                            outInterp: prop.keyOutInterpolationType(ki),
                            easeIn: prop.canVaryOverTime ? prop.keyInTemporalEase(ki) : null,
                            easeOut: prop.canVaryOverTime ? prop.keyOutTemporalEase(ki) : null
                        });
                    }
                    
                    for (var k = keys.length - 1; k >= 0; k--) {
                        prop.removeKey(keys[k]);
                    }
                    
                    for (var k = 0; k < keyData.length; k++) {
                        var data = keyData[k];
                        prop.addKey(data.newTime);
                        var newIdx = prop.nearestKeyIndex(data.newTime);
                        prop.setValueAtKey(newIdx, data.value);
                        prop.setInterpolationTypeAtKey(newIdx, data.inInterp, data.outInterp);
                        if (data.easeIn && data.easeOut) {
                            prop.setTemporalEaseAtKey(newIdx, data.easeIn, data.easeOut);
                        }
                        count++;
                    }
                }
            }
            app.endUndoGroup();
            if (count === 0) return MotionreisUtils.sendError("Select a property with keyframes to snap.");
            return MotionreisUtils.sendResponse("Snapped " + count + " keyframes to whole frames.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // ---- TRANSITION SHIFTER ----

    // Stagger layers in-points or out-points
    staggerTransitions: function(args) {
        try {
            app.beginUndoGroup("Stagger Transitions");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var frames   = parseFloat(args.frames || 2);
            var mode     = args.mode   || 'asc'; // asc, desc, random
            var target   = args.target || 'layers'; // 'layers', 'inPoint', 'outPoint'
            var offsetTime = frames * comp.frameDuration;

            // Build ordered list
            var ordered = layers.slice();
            if (mode === 'desc') ordered.reverse();
            else if (mode === 'random') ordered.sort(function() { return 0.5 - Math.random(); });

            for (var i = 0; i < ordered.length; i++) {
                var l = ordered[i];
                var shift = i * offsetTime;
                if (target === 'inPoint')       l.inPoint  += shift;
                else if (target === 'outPoint') l.outPoint += shift;
                else                            l.startTime += shift;
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Berhasil stagger " + layers.length + " layers (" + target + ", " + mode + ").");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // Align layers in-points or out-points to playhead
    alignTransitions: function(args) {
        try {
            app.beginUndoGroup("Align Transitions");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var playhead = comp.time;
            var target = args.target || 'inPoint'; // 'inPoint', 'outPoint', 'startTime'

            for (var i = 0; i < layers.length; i++) {
                var l = layers[i];
                if (target === 'outPoint')       l.outPoint  = playhead;
                else if (target === 'startTime') l.startTime = playhead;
                else                             l.inPoint   = playhead;
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully aligned " + layers.length + " layers to playhead (" + target + ").");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // Shift all selected layers in time
    shiftLayers: function(args) {
        try {
            app.beginUndoGroup("Shift Layers");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var frames = parseFloat(args.frames || 0);
            var offsetTime = frames * comp.frameDuration;
            for (var i = 0; i < layers.length; i++) layers[i].startTime += offsetTime;
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully shifted " + layers.length + " layers by " + frames + " frames.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // ---- 6. PATH RIGGING & EXPRESSIONS ----
    getPropPathStr: function(prop) {
        var str = "";
        var current = prop;
        while (current.parentProperty) {
            if (current.matchName === "ADBE Mask Atom") {
                str = '.mask("' + current.name + '")' + str;
            } else if (current.matchName === "ADBE Mask Shape") {
                str = '.maskPath' + str;
            } else if (current.parentProperty.matchName === "ADBE Root Vectors Group" || current.parentProperty.matchName === "ADBE Vector Group" || current.parentProperty.matchName === "ADBE Vector Shape - Group") {
                str = '.content("' + current.name + '")' + str;
            } else if (current.matchName === "ADBE Vector Shape") {
                str = '.path' + str;
            }
            current = current.parentProperty;
        }
        return str;
    },
    
    getLayerObj: function(prop) {
        var layers = prop;
        while (layers.parentProperty) { layers = layers.parentProperty; }
        return layers;
    },

    pointsFollowNulls: function() {
        try {
            app.beginUndoGroup("Points Follow Nulls");
            var comp = MotionreisUtils.getActiveComp();
            var props = comp.selectedProperties;
            if (props.length === 0 || (props[0].propertyValueType !== PropertyValueType.SHAPE)) return MotionreisUtils.sendError("Pilih path pada Shape atau Mask!");
            var pathProp = props[0];
            var vertices = pathProp.value.vertices;
            var nullNames = [];
            var layers = this.getLayerObj(pathProp);
            
            for (var i = 0; i < vertices.length; i++) {
                var nullLayer = comp.layers.addNull();
                nullLayer.name = pathProp.parentProperty.name + " Point " + (i + 1);
                var worldPos = layers.toComp(vertices[i]);
                nullLayer.position.setValue(worldPos);
                nullLayer.label = 10;
                nullLayer.transform.scale.setValue([50, 50]);
                
                // Force Null duration and in/out points to match source layer
                nullLayer.inPoint = layers.inPoint;
                nullLayer.outPoint = layers.outPoint;
                nullLayer.moveBefore(layers);
                
                nullNames.push(nullLayer.name);
            }
            
            var expr = "var nullNames = " + JSON.stringify(nullNames) + ";\n" +
                       "var origPath = thisProperty;\n" +
                       "var origPts = origPath.points();\n" +
                       "var inT = origPath.inTangents();\n" +
                       "var outT = origPath.outTangents();\n" +
                       "var closed = origPath.isClosed();\n" +
                       "var pts = [];\n" +
                       "for (var i = 0; i < nullNames.length; i++) {\n" +
                       "    var nL = thisComp.layers(nullNames[i]);\n" +
                       "    pts.push(fromComp(nL.toComp(nL.anchorPoint)));\n" +
                       "}\n" +
                       "createPath(pts, inT, outT, closed);";
            pathProp.expression = expr;
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully created " + vertices.length + " Nulls controlling the path.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    nullsFollowPoints: function() {
        try {
            app.beginUndoGroup("Nulls Follow Points");
            var comp = MotionreisUtils.getActiveComp();
            var props = comp.selectedProperties;
            if (props.length === 0 || (props[0].propertyValueType !== PropertyValueType.SHAPE)) return MotionreisUtils.sendError("Pilih path pada Shape atau Mask!");
            var pathProp = props[0];
            var vertices = pathProp.value.vertices;
            var layers = this.getLayerObj(pathProp);
            var pathStr = 'thisComp.layers("' + layers.name + '")' + this.getPropPathStr(pathProp);
            
            for (var i = 0; i < vertices.length; i++) {
                var nullLayer = comp.layers.addNull();
                nullLayer.name = pathProp.parentProperty.name + " Tracker " + (i + 1);
                nullLayer.label = 11;
                nullLayer.transform.scale.setValue([50, 50]);
                
                // Force Null duration and in/out points to match source layer
                nullLayer.inPoint = layers.inPoint;
                nullLayer.outPoint = layers.outPoint;
                nullLayer.moveBefore(layers);
                
                var expr = "var pathLyr = thisComp.layers(\"" + layers.name + "\");\n" +
                           "var pathProp = " + pathStr + ";\n" +
                           "var pt = pathProp.points()[" + i + "];\n" +
                           "pathLyr.toComp(pt);";
                nullLayer.position.expression = expr;
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully created " + vertices.length + " Nulls tracking the points.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    tracePath: function() {
        try {
            app.beginUndoGroup("Trace Path");
            var comp = MotionreisUtils.getActiveComp();
            var props = comp.selectedProperties;
            if (props.length === 0 || (props[0].propertyValueType !== PropertyValueType.SHAPE)) return MotionreisUtils.sendError("Pilih path pada Shape atau Mask!");
            var pathProp = props[0];
            var layers = this.getLayerObj(pathProp);
            var pathStr = 'thisComp.layers("' + layers.name + '")' + this.getPropPathStr(pathProp);
            
            var nullLayer = comp.layers.addNull();
            nullLayer.name = pathProp.parentProperty.name + " Tracer";
            nullLayer.label = 8;
            nullLayer.transform.scale.setValue([75, 75]);
            
            // Force Null duration and in/out points to match source layer
            nullLayer.inPoint = layers.inPoint;
            nullLayer.outPoint = layers.outPoint;
            nullLayer.moveBefore(layers);
            
            var slider = nullLayer.Effects.addProperty("ADBE Slider Control");
            slider.name = "Progress";
            slider.property("Slider").setValue(0);
            
            var expr = "var pathLyr = thisComp.layers(\"" + layers.name + "\");\n" +
                       "var pathProp = " + pathStr + ";\n" +
                       "var progress = effect(\"Progress\")(\"Slider\") / 100;\n" +
                       "var pt = pathProp.pointOnPath(progress);\n" +
                       "pathLyr.toComp(pt);";
            nullLayer.position.expression = expr;
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Trace Path Null created successfully. Animate the 'Progress' slider.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    applyLoop: function(args) {
        try {
            app.beginUndoGroup("Loop Expression");
            var comp = MotionreisUtils.getActiveComp();
            var props = comp.selectedProperties;
            if (props.length === 0) return MotionreisUtils.sendError("Pilih minimal 1 properti untuk diloop.");
            var io = args.io === 'in' ? 'In' : 'Out';
            var expr = "loop" + io + "(\"" + (args.type || 'cycle') + "\");";
            var count = 0;
            for (var i = 0; i < props.length; i++) {
                if (props[i].canSetExpression) { 
                    var cur = props[i].expression;
                    props[i].expression = (cur && cur !== "") ? cur + (cur.charAt(cur.length-1) === ';' ? '\n' : ';\n') + expr : expr;
                    count++; 
                }
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully applied loop to " + count + " properties.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    applyBounce: function() {
        try {
            app.beginUndoGroup("Bounce Expression");
            var comp = MotionreisUtils.getActiveComp();
            var props = comp.selectedProperties;
            var expr = "var e = 0.7;\nvar g = 5000;\nvar nMax = 9;\nvar n = 0;\nif (numKeys > 0) {\n  n = nearestKey(time).index;\n  if (key(n).time > time) n--;\n}\nif (n > 0) {\n  var t = time - key(n).time;\n  var v = -velocityAtTime(key(n).time - 0.001) * e;\n  var vl = length(v);\n  if (value.length) {\n    var vu = (vl > 0) ? normalize(v) : [0,0,0,0].slice(0, value.length);\n  } else {\n    var vu = (v < 0) ? -1 : 1;\n  }\n  t = Math.max(0, t);\n  var y = 0, tv = 0;\n  while(true) {\n    tv = vl/g;\n    if (t < tv*2) {\n      y = vl*t - 0.5*g*t*t;\n      break;\n    }\n    t -= tv*2;\n    vl *= e;\n    nMax--;\n    if (nMax === 0) {\n      y = 0;\n      break;\n    }\n  }\n  value + (vu * y);\n} else {\n  value;\n}";
            var count = 0;
            for (var i = 0; i < props.length; i++) {
                if (props[i].canSetExpression) { 
                    var cur = props[i].expression;
                    props[i].expression = (cur && cur !== "") ? cur + (cur.charAt(cur.length-1) === ';' ? '\n' : ';\n') + expr : expr;
                    count++; 
                }
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Bounce expression applied to " + count + " properties.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    applyElastic: function() {
        try {
            app.beginUndoGroup("Elastic Expression");
            var comp = MotionreisUtils.getActiveComp();
            var props = comp.selectedProperties;
            var expr = "var amp = 0.05;\nvar freq = 3;\nvar decay = 5;\nvar n = 0;\nif (numKeys > 0) {\n  n = nearestKey(time).index;\n  if (key(n).time > time) n--;\n}\nif (n > 0) {\n  var t = time - key(n).time;\n  var v = velocityAtTime(key(n).time - 0.01);\n  value + v * amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);\n} else {\n  value;\n}";
            var count = 0;
            for (var i = 0; i < props.length; i++) {
                if (props[i].canSetExpression) { 
                    var cur = props[i].expression;
                    props[i].expression = (cur && cur !== "") ? cur + (cur.charAt(cur.length-1) === ';' ? '\n' : ';\n') + expr : expr;
                    count++; 
                }
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Elastic expression applied to " + count + " properties.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    bakeExpressions: function() {
        try {
            var comp = MotionreisUtils.getActiveComp();
            var selectedLayers = MotionreisUtils.getSelectedLayers(comp);
            var selectedProps = comp.selectedProperties;
            
            if (selectedLayers.length === 0 && selectedProps.length === 0) {
                return MotionreisUtils.sendError("Select a layer or property with an active expression.");
            }
            
            function hasActiveExpression(propGroup) {
                for (var i = 1; i <= propGroup.numProperties; i++) {
                    var prop = propGroup.property(i);
                    if (prop.propertyType === PropertyType.PROPERTY) {
                        if (prop.canSetExpression && prop.expressionEnabled && prop.expression !== "") {
                            return true;
                        }
                    } else if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                        if (hasActiveExpression(prop)) return true;
                    }
                }
                return false;
            }
            
            var foundExpr = false;
            if (selectedProps.length > 0) {
                for (var p = 0; p < selectedProps.length; p++) {
                    if (selectedProps[p].canSetExpression && selectedProps[p].expressionEnabled && selectedProps[p].expression !== "") {
                        foundExpr = true;
                        break;
                    }
                }
            } else {
                for (var l = 0; l < selectedLayers.length; l++) {
                    if (hasActiveExpression(selectedLayers[l])) {
                        foundExpr = true;
                        break;
                    }
                }
            }
            
            if (!foundExpr) {
                return MotionreisUtils.sendError("No active expressions found in the current selection.");
            }
            
            app.beginUndoGroup("Bake Expressions");
            app.executeCommand(app.findMenuCommandId("Convert Expression to Keyframes"));
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Ekspresi berhasil di-bake menjadi keyframes.");
        } catch(e) { 
            app.endUndoGroup(); 
            return MotionreisUtils.sendError(e.message); 
        }
    },

    // ---- SMART SEQUENCE & TRIM ----
    // Sequence layers back-to-back with optional overlap frames (like AE's native Sequence Layers)
    smartStagger: function(args) {
        try {
            app.beginUndoGroup("Smart Stagger");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            if (layers.length < 2) return MotionreisUtils.sendError("Select at least 2 layers buat di-stagger.");

            var overlapFrames = parseFloat(args.frames || 0);
            var overlapTime = overlapFrames * comp.frameDuration;

            // Sort by current in-point (top to bottom = smallest index first)
            layers.sort(function(a, b) { return a.index - b.index; });

            // First layers stays, sequence the rest after it
            var cursor = layers[0].outPoint;
            for (var i = 1; i < layers.length; i++) {
                var dur = layers[i].outPoint - layers[i].inPoint;
                layers[i].startTime = cursor - overlapTime - layers[i].inPoint;
                cursor = layers[i].outPoint;
            }

            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully sequenced " + layers.length + " layers with overlap " + overlapFrames + " frames.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // Trim layers in/out points to its first and last keyframes
    smartTrim: function() {
        try {
            app.beginUndoGroup("Trim to Keys");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            if (layers.length === 0) return MotionreisUtils.sendError("Select layers to di-trim.");

            var trimmed = 0;
            for (var i = 0; i < layers.length; i++) {
                var l = layers[i];
                var firstKey = Infinity, lastKey = -Infinity;
                var found = false;

                // Scan all properties recursively for keyframes
                function scanProps(propGroup) {
                    for (var p = 1; p <= propGroup.numProperties; p++) {
                        var prop = propGroup.property(p);
                        if (prop.numKeys > 0) {
                            found = true;
                            var t1 = prop.keyTime(1);
                            var t2 = prop.keyTime(prop.numKeys);
                            if (t1 < firstKey) firstKey = t1;
                            if (t2 > lastKey) lastKey = t2;
                        }
                        if (prop.propertyType !== PropertyType.PROPERTY && prop.numProperties) {
                            scanProps(prop);
                        }
                    }
                }
                scanProps(l);

                if (found) {
                    // Clamp to comp bounds
                    if (firstKey < l.inPoint) firstKey = l.inPoint;
                    if (lastKey > l.outPoint) lastKey = l.outPoint;
                    l.inPoint = firstKey;
                    l.outPoint = lastKey;
                    trimmed++;
                }
            }

            app.endUndoGroup();
            if (trimmed === 0) return MotionreisUtils.sendError("Gak ada keyframes yang ketemu. Trim gagal.");
            return MotionreisUtils.sendResponse("Successfully trimmed " + trimmed + " layers ngepas ke keyframes-nya.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // Crop precomp duration to tightest bounds of all its layers
    autoPrecompCrop: function() {
        try {
            app.beginUndoGroup("Crop Precomp");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);

            var targets = [];
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].source && layers[i].source instanceof CompItem) {
                    targets.push(layers[i].source);
                }
            }

            // If nothing selected, crop the active comp itself
            if (targets.length === 0) targets.push(comp);

            var cropped = 0;
            for (var t = 0; t < targets.length; t++) {
                var c = targets[t];
                var earliest = Infinity, latest = -Infinity;

                for (var j = 1; j <= c.numLayers; j++) {
                    var l = c.layers(j);
                    if (l.inPoint < earliest) earliest = l.inPoint;
                    if (l.outPoint > latest)  latest  = l.outPoint;
                }

                if (earliest !== Infinity && latest > earliest) {
                    // Shift all layers so earliest starts at 0
                    if (earliest !== 0) {
                        for (var j = 1; j <= c.numLayers; j++) {
                            c.layers(j).startTime -= earliest;
                        }
                    }
                    c.duration = latest - earliest;
                    cropped++;
                }
            }

            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully cropped duration for " + cropped + " compositions.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // -----------------------------------------------------------------------------------
    // MASTER EXPRESSION LINKER
    // -----------------------------------------------------------------------------------
    masterExpressionLinker: function() {
        try {
            app.beginUndoGroup("Master Expression Linker");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            if (layers.length === 0) return MotionreisUtils.sendError("Select properties to link to Master Null.");
            
            var masterNull = null;
            for (var i = 1; i <= comp.numLayers; i++) {
                if (comp.layer(i).name === "Master Controller") {
                    masterNull = comp.layer(i);
                    break;
                }
            }
            if (!masterNull) {
                masterNull = comp.layers.addNull();
                masterNull.name = "Master Controller";
                masterNull.guideLayer = true;
                masterNull.label = 10;
            }
            
            var linked = 0;
            for (var i = 0; i < layers.length; i++) {
                var props = layers[i].selectedProperties;
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    if (prop.canSetExpression) {
                        var sliderName = layers[i].name + " " + prop.name;
                        var effect = masterNull.effect.addProperty("ADBE Slider Control");
                        effect.name = sliderName;
                        if (prop.propertyValueType === PropertyValueType.OneD) {
                            effect.property("Slider").setValue(prop.value);
                            prop.expression = 'thisComp.layer("Master Controller").effect("' + sliderName + '")("Slider")';
                        } else if (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.TwoD) {
                            prop.expression = 'var v = thisComp.layer("Master Controller").effect("' + sliderName + '")("Slider"); [v, v]';
                        } else if (prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD) {
                            prop.expression = 'var v = thisComp.layer("Master Controller").effect("' + sliderName + '")("Slider"); [v, v, v]';
                        }
                        linked++;
                    }
                }
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Linked " + linked + " properties to Master Controller.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // -----------------------------------------------------------------------------------
    // AUTO SWAY
    // -----------------------------------------------------------------------------------
    applyAutoSway: function() {
        try {
            app.beginUndoGroup("Auto Sway");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            if (layers.length === 0) return MotionreisUtils.sendError("Select layers to apply sway.");
            
            var count = 0;
            var swayExpr = "var freq = 2;\nvar amp = 15;\nMath.sin(time * freq * Math.PI * 2) * amp + value;";
            
            for (var i = 0; i < layers.length; i++) {
                var rot = layers[i].property("ADBE Transform Group").property("ADBE Rotate Z");
                if (!rot) rot = layers[i].property("ADBE Transform Group").property("ADBE Rotation");
                if (rot && rot.canSetExpression) {
                    var cur = rot.expression;
                    rot.expression = (cur && cur !== "") ? cur + (cur.charAt(cur.length-1) === ';' ? '\n' : ';\n') + swayExpr : swayExpr;
                    count++;
                }
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Auto Sway applied to " + count + " layers.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    createNewLayer: function(args) {
        try {
            app.beginUndoGroup("New " + args.type);
            var comp = MotionreisUtils.getActiveComp();
            if (!comp) return MotionreisUtils.sendError("No active composition.");
            
            var type = args.type.toLowerCase();
            var newLayer = null;
            
            if (type === "solid") {
                // Create a standard solid matching comp size
                var color = [1, 1, 1]; // white default
                newLayer = comp.layers.addSolid(color, "Solid", comp.width, comp.height, comp.pixelAspect, comp.duration);
            } 
            else if (type === "adjustment") {
                // Adjustment layer is a solid layer with adjustmentLayer set to true
                var color = [1, 1, 1];
                newLayer = comp.layers.addSolid(color, "Adjustment Layer", comp.width, comp.height, comp.pixelAspect, comp.duration);
                newLayer.adjustmentLayer = true;
            } 
            else if (type === "text") {
                newLayer = comp.layers.addText("Text");
            } 
            else if (type === "shape") {
                newLayer = comp.layers.addShape();
                newLayer.name = "Shape Layer";
            } 
            else if (type === "camera") {
                var center = [comp.width / 2, comp.height / 2];
                newLayer = comp.layers.addCamera("Camera", center);
            } 
            else if (type === "light") {
                newLayer = comp.layers.addLight("Light", [comp.width / 2, comp.height / 2, -500]);
            }
            
            if (newLayer) {
                app.executeCommand(2004); // Deselect All
                newLayer.selected = true;
                app.endUndoGroup();
                return MotionreisUtils.sendResponse("Layer created successfully.");
            } else {
                app.endUndoGroup();
                return MotionreisUtils.sendError("Failed to create layer of type: " + args.type);
            }
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // Router function called from UI
    run: function(argsStr) {
        var args = JSON.parse(argsStr);
        if (args.action === 'TL' || args.action === 'TC' || args.action === 'TR' || 
            args.action === 'ML' || args.action === 'MC' || args.action === 'MR' || 
            args.action === 'BL' || args.action === 'BC' || args.action === 'BR') {
            return this.anchor(argsStr);
        }
        if (args.action === 'nullFromSelection') return this.nullFromSelection(argsStr);
        if (args.action === 'createNewLayer')    return this.createNewLayer(args);
        if (args.action === 'applyWiggle')       return this.applyWiggle(args);
        if (args.action === 'applyEaseIn' || args.action === 'applyEaseOut' || args.action === 'applyEaseBoth') return this.applyEase(args);
        if (args.action === 'applyEaseSlider')   return this.applyEaseSlider(args);
        if (args.action === 'getRawEaseData')    return this.getRawEaseData();
        if (args.action === 'applyRawEase')      return this.applyRawEase(args);
        if (args.action === 'staggerLayers')     return this.staggerLayers(args);
        if (args.action === 'staggerKeys')       return this.staggerKeys(args);
        if (args.action === 'copyEase')          return this.copyEase();
        if (args.action === 'pasteEase')         return this.pasteEase();
        // Keyframes Actions
        if (args.action === 'mirrorKeys')        return this.mirrorKeys();
        if (args.action === 'reverseKeys')       return this.reverseKeys();
        if (args.action === 'cloneKeys')         return this.cloneKeys();
        if (args.action === 'shiftKeys')         return this.shiftKeys(args);
        if (args.action === 'alignKeys')         return this.alignKeys(args);
        if (args.action === 'randomizeKeys')     return this.randomizeKeys(args);
        if (args.action === 'snapKeys')          return this.snapKeys();
        // Transition Shifter
        if (args.action === 'staggerTransitions')  return this.staggerTransitions(args);
        if (args.action === 'alignTransitions')    return this.alignTransitions(args);
        if (args.action === 'shiftLayers')         return this.shiftLayers(args);
        
        // Path Rigging & Expressions
        if (args.action === 'pointsFollowNulls') return this.pointsFollowNulls();
        if (args.action === 'nullsFollowPoints') return this.nullsFollowPoints();
        if (args.action === 'tracePath')         return this.tracePath();
        if (args.action === 'applyLoop')         return this.applyLoop(args);
        if (args.action === 'applyBounce')       return this.applyBounce();
        if (args.action === 'applyElastic')      return this.applyElastic();
        if (args.action === 'bakeExpressions')   return this.bakeExpressions();
        if (args.action === 'smartStagger')       return this.smartStagger(args);
        if (args.action === 'smartTrim')          return this.smartTrim();
        if (args.action === 'autoPrecompCrop')    return this.autoPrecompCrop();
        if (args.action === 'masterExpressionLinker') return this.masterExpressionLinker();
        if (args.action === 'applyAutoSway')      return this.applyAutoSway();

        return MotionreisUtils.sendError("Function not yet implemented: " + args.action);
    }
};
