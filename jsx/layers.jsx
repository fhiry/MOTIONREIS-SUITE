// Include utils
//@include "utils.jsx"

var layers = {
    // ---- BATCH OPS ----
    batchRename: function(args) {
        try {
            app.beginUndoGroup("Batch Rename");
            var comp = MotionreisUtils.getActiveComp();
            var selectedLayers = MotionreisUtils.getSelectedLayers(comp);
            
            var nameTemplate = args.name || "Layer #";
            
            for (var i = 0; i < selectedLayers.length; i++) {
                var newName = nameTemplate.replace(/#/g, (i + 1).toString());
                selectedLayers[i].name = newName;
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Berhasil rename " + selectedLayers.length + " layer.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },
    
    batchTrim: function(args) {
        try {
            app.beginUndoGroup("Batch Trim");
            var comp = MotionreisUtils.getActiveComp();
            var selectedLayers = MotionreisUtils.getSelectedLayers(comp);
            
            for (var i = 0; i < selectedLayers.length; i++) {
                selectedLayers[i].inPoint = comp.time;
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Berhasil trim " + selectedLayers.length + " layer ke Playhead.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- AUTO CROP ----
    autoCrop: function() {
        try {
            app.beginUndoGroup("Auto Crop Comp");
            var comp = MotionreisUtils.getActiveComp();
            if (comp.numLayers === 0) return MotionreisUtils.sendError("Composition is empty.");
            
            var minX = 999999;
            var minY = 999999;
            var maxX = -999999;
            var maxY = -999999;
            
            // Calculate bounding box of all layers
            for (var i = 1; i <= comp.numLayers; i++) {
                var l = comp.layer(i);
                if (!l.active) continue; // skip hidden
                
                // Use sourceRectAtTime if available (shapes, text)
                if (typeof l.sourceRectAtTime === "function") {
                    var rect = l.sourceRectAtTime(comp.time, false);
                    var scale = l.scale.value;
                    var pos = l.position.value;
                    
                    // Simple estimation based on anchor and pos
                    var left = pos[0] - (l.anchorPoint.value[0] * (scale[0]/100)) + (rect.left * (scale[0]/100));
                    var top = pos[1] - (l.anchorPoint.value[1] * (scale[1]/100)) + (rect.top * (scale[1]/100));
                    var right = left + (rect.width * (scale[0]/100));
                    var bottom = top + (rect.height * (scale[1]/100));
                    
                    if (left < minX) minX = left;
                    if (top < minY) minY = top;
                    if (right > maxX) maxX = right;
                    if (bottom > maxY) maxY = bottom;
                } else {
                    // Fallback for basic layers
                    var pos = l.position.value;
                    if (pos[0] < minX) minX = pos[0] - 50;
                    if (pos[1] < minY) minY = pos[1] - 50;
                    if (pos[0] > maxX) maxX = pos[0] + 50;
                    if (pos[1] > maxY) maxY = pos[1] + 50;
                }
            }
            
            if (minX >= maxX || minY >= maxY) return MotionreisUtils.sendError("Failed to calculate layer size.");
            
            // Add padding
            var pad = 10;
            minX -= pad;
            minY -= pad;
            maxX += pad;
            maxY += pad;
            
            var newW = Math.round(maxX - minX);
            var newH = Math.round(maxY - minY);
            
            // Limit bounds
            if (newW < 4) newW = 4;
            if (newH < 4) newH = 4;
            
            // Create a Master Null to shift everything
            var masterNull = comp.layers.addNull();
            masterNull.position.setValue([0, 0]);
            
            var originalParents = [];
            for (var i = 2; i <= comp.numLayers; i++) {
                var l = comp.layer(i);
                originalParents.push({layer: l, parent: l.parent});
                if (l.parent === null) {
                    l.parent = masterNull;
                }
            }
            
            // Shift the null to move everything to top-left
            masterNull.position.setValue([-minX, -minY]);
            
            // Unparent and delete null
            for (var i = 0; i < originalParents.length; i++) {
                if (originalParents[i].parent === null) {
                    originalParents[i].layer.parent = null;
                }
            }
            masterNull.remove();
            
            // Resize comp
            comp.width = newW;
            comp.height = newH;
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Komposisi berhasil di-crop otomatis (" + newW + "x" + newH + ").");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- COLOR MANAGER ----
    linkColors: function(args) {
        try {
            app.beginUndoGroup("Link Colors");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var type = args.type || "Fill"; // "Fill" or "Stroke"
            
            if (layers.length === 0) return MotionreisUtils.sendError("Select at least 1 Shape Layer.");
            
            // Find or create Global Colors Null
            var colorNull = null;
            for (var i = 1; i <= comp.numLayers; i++) {
                if (comp.layer(i).name === "Global Colors") {
                    colorNull = comp.layer(i);
                    break;
                }
            }
            if (!colorNull) {
                colorNull = comp.layers.addNull();
                colorNull.name = "Global Colors";
                colorNull.guideLayer = true;
                colorNull.label = 11; // Orange
            }
            
            // Find or create Color Control effect
            var effectName = "Master " + type;
            var colorEffect = colorNull.effect.getProperty(effectName);
            if (!colorEffect) {
                colorEffect = colorNull.effect.addProperty("ADBE Color Control");
                colorEffect.name = effectName;
                // Default color
                if (type === "Fill") colorEffect.property("Color").setValue([0.9, 0.1, 0.3, 1]);
                if (type === "Stroke") colorEffect.property("Color").setValue([1, 1, 1, 1]);
            }
            
            var expr = 'thisComp.layer("Global Colors").effect("' + effectName + '")("Color")';
            var linkedCount = 0;
            
            // Loop through selected layers and apply expression to fills/strokes
            for (var i = 0; i < layers.length; i++) {
                var l = layers[i];
                var props = l.selectedProperties;
                
                // If user selected specific properties
                if (props.length > 0) {
                    for (var p = 0; p < props.length; p++) {
                        if (props[p].matchName === "ADBE Vector Fill Color" || props[p].matchName === "ADBE Vector Stroke Color") {
                            props[p].expression = expr;
                            linkedCount++;
                        }
                    }
                } else {
                    // Search recursively for all fills/strokes if no property selected
                    function searchAndLinkColors(propGroup) {
                        for (var j = 1; j <= propGroup.numProperties; j++) {
                            var prop = propGroup.property(j);
                            if (prop.propertyType === PropertyType.PROPERTY) {
                                if ((type === "Fill" && prop.matchName === "ADBE Vector Fill Color") || 
                                    (type === "Stroke" && prop.matchName === "ADBE Vector Stroke Color")) {
                                    prop.expression = expr;
                                    linkedCount++;
                                }
                            } else if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                                searchAndLinkColors(prop);
                            }
                        }
                    }
                    if (l instanceof ShapeLayer) {
                        searchAndLinkColors(l.property("ADBE Root Vectors Group"));
                    } else if (l instanceof TextLayer) {
                        if (type === "Fill") l.property("ADBE Text Properties").property("ADBE Text Document").expression = ""; // Text has no simple expression for color natively without animators, skipping text for now
                    }
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Berhasil nge-link " + linkedCount + " properti " + type + " ke Master Null.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- COLOR MANAGER ----
    unlinkColors: function() {
        try {
            app.beginUndoGroup("Unlink Colors");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var unlinkedCount = 0;
            for (var i = 0; i < layers.length; i++) {
                var l = layers[i];
                var props = l.selectedProperties;
                
                if (props.length > 0) {
                    for (var p = 0; p < props.length; p++) {
                        if (props[p].canSetExpression && props[p].expression !== "") {
                            props[p].expression = "";
                            unlinkedCount++;
                        }
                    }
                } else {
                    // Try to clear all expressions on fill/stroke
                    function clearExpr(propGroup) {
                        for (var j = 1; j <= propGroup.numProperties; j++) {
                            var prop = propGroup.property(j);
                            if (prop.propertyType === PropertyType.PROPERTY) {
                                if ((prop.matchName === "ADBE Vector Fill Color" || prop.matchName === "ADBE Vector Stroke Color") && prop.expression !== "") {
                                    prop.expression = "";
                                    unlinkedCount++;
                                }
                            } else if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                                clearExpr(prop);
                            }
                        }
                    }
                    if (l instanceof ShapeLayer) {
                        clearExpr(l.property("ADBE Root Vectors Group"));
                    }
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Berhasil menghapus expression dari " + unlinkedCount + " properties.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },
    groupLayers: function() {
        try {
            app.beginUndoGroup("Group Layers (Workflower)");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            if (layers.length === 0) return MotionreisUtils.sendError("Select layers to group.");
            
            // Find highest layer index to place folder above it
            var minIndex = 999999;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].index < minIndex) minIndex = layers[i].index;
            }
            
            var folderNum = 1;
            for (var i = 1; i <= comp.numLayers; i++) {
                if (comp.layer(i).name.indexOf("📁 FOLDER") !== -1) folderNum++;
            }
            
            var folderNull = comp.layers.addNull();
            folderNull.name = "📁 FOLDER " + folderNum;
            folderNull.guideLayer = true;
            folderNull.label = 15; // Cyan
            folderNull.moveBefore(comp.layer(minIndex));
            
            for (var i = 0; i < layers.length; i++) {
                // We don't reparent if it already has a parent inside the selection
                // Just parent orphans to the folder
                var isParentInSelection = false;
                for (var j = 0; j < layers.length; j++) {
                    if (layers[i].parent === layers[j]) {
                        isParentInSelection = true;
                        break;
                    }
                }
                if (!isParentInSelection) {
                    layers[i].parent = folderNull;
                }
                // Simulate nesting by indenting name (optional visual hack)
                // layers[i].name = "  " + layers[i].name; 
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Berhasil membuat Virtual Folder untuk " + layers.length + " layer.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    ungroupLayers: function() {
        try {
            app.beginUndoGroup("Ungroup Layers");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var parentNull = null;
            
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].name.indexOf("📁 FOLDER") !== -1) {
                    parentNull = layers[i];
                    break;
                }
            }
            if (!parentNull) return MotionreisUtils.sendError("Select a Virtual Folder to ungroup.");
            
            var childCount = 0;
            for (var i = 1; i <= comp.numLayers; i++) {
                if (comp.layer(i).parent === parentNull) {
                    comp.layer(i).parent = null;
                    childCount++;
                }
            }
            parentNull.remove();
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Berhasil ungroup folder dan membebaskan " + childCount + " layer.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },
    
    primeClone: function() {
        try {
            app.beginUndoGroup("Prime Clone");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            if (layers.length === 0) return MotionreisUtils.sendError("Select a layer to clone.");
            
            var cloned = 0;
            for (var i = 0; i < layers.length; i++) {
                var clone = layers[i].duplicate();
                clone.name = layers[i].name + " (Clone)";
                clone.moveBefore(layers[i]);
                cloned++;
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse(cloned + " layer berhasil di-clone.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },
    
    preRender: function() {
        try {
            app.beginUndoGroup("Pre-Render");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            if (layers.length === 0) return MotionreisUtils.sendError("Select layers to precomp.");
            
            // Calculate combined timing bounds of selected layers before precomposing
            var minIn = layers[0].inPoint;
            var maxOut = layers[0].outPoint;
            for (var i = 1; i < layers.length; i++) {
                if (layers[i].inPoint < minIn) minIn = layers[i].inPoint;
                if (layers[i].outPoint > maxOut) maxOut = layers[i].outPoint;
            }
            
            var indices = [];
            for (var i = 0; i < layers.length; i++) indices.push(layers[i].index);
            
            // Clean comp name
            var cleanName = layers[0].name.replace(/[\/\*:\?\"\<\>\|]/g, "_");
            var compName = "Pre-comp " + cleanName;
            
            var newComp = comp.layers.precompose(indices, compName, true);
            
            // Trimming & Shifting logic (replicating AE native "Adjust composition duration to the time span of the selected layers" behavior)
            var span = maxOut - minIn;
            if (span <= 0) span = 1 / comp.frameRate;
            
            // 1. Shift all layers inside the new comp to start at 0
            for (var k = 1; k <= newComp.numLayers; k++) {
                newComp.layer(k).startTime -= minIn;
            }
            
            // 2. Resize the new comp duration to exactly fit the span
            newComp.duration = span;
            newComp.workAreaStart = 0;
            newComp.workAreaDuration = span;
            
            // 3. Find and adjust the precomp layer in the parent comp
            var precompLayer = null;
            for (var j = 1; j <= comp.numLayers; j++) {
                if (comp.layer(j).source === newComp) {
                    precompLayer = comp.layer(j);
                    break;
                }
            }
            if (precompLayer) {
                precompLayer.startTime = minIn;
                precompLayer.inPoint = minIn;
                precompLayer.outPoint = maxOut;
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Layer berhasil di-precompose jadi " + newComp.name);
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },
    deepDuplicateComp: function() {
        try {
            app.beginUndoGroup("Deep Duplicate Comp");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            if (layers.length === 0 || !(layers[0].source instanceof CompItem)) {
                return MotionreisUtils.sendError("Select a pre-comp layer to Deep Duplicate.");
            }
            
            var layer = layers[0];
            var originalCompItem = layer.source;
            
            // Duplicate the CompItem in Project Panel
            var duplicatedCompItem = originalCompItem.duplicate();
            duplicatedCompItem.name = originalCompItem.name + " 2";
            
            // Duplicate the layer in the timeline
            var duplicatedLayer = layer.duplicate();
            
            // Replace the source of the duplicated layer with the new independent CompItem
            duplicatedLayer.replaceSource(duplicatedCompItem, false);
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Berhasil Deep Duplicate pre-comp.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- SHAPE TOOLKIT ----
    explodeShapeLayer: function() {
        try {
            app.beginUndoGroup("Extract Shapes");
            var comp = MotionreisUtils.getActiveComp();
            
            // Force focus on the composition viewer so timeline operations don't fail
            if (comp.openInViewer) {
                comp.openInViewer();
            }
            
            var layers = MotionreisUtils.getSelectedLayers(comp);
            if (layers.length === 0) {
                return MotionreisUtils.sendError("Select at least one Shape Layer.");
            }
            
            var hasShapeLayer = false;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i] instanceof ShapeLayer) {
                    hasShapeLayer = true;
                    break;
                }
            }
            if (!hasShapeLayer) {
                return MotionreisUtils.sendError("Selected layer is not a Shape Layer.");
            }
            
            var explodedLayersCount = 0;
            var newSelectedLayers = [];
            
            for (var L = 0; L < layers.length; L++) {
                var shapeLayer = layers[L];
                if (!(shapeLayer instanceof ShapeLayer)) continue;
                
                // Find all selected shape groups inside this layer
                var selectedProps = comp.selectedProperties;
                var selectedGroups = [];
                for (var p = 0; p < selectedProps.length; p++) {
                    var prop = selectedProps[p];
                    
                    // Verify if this property belongs to the current shapeLayer
                    var propLayer = prop;
                    while (propLayer && propLayer.parentProperty) {
                        propLayer = propLayer.parentProperty;
                    }
                    
                    if (propLayer === shapeLayer) {
                        // In After Effects, a shape group is represented by ADBE Vector Group
                        if (prop.matchName === "ADBE Vector Group" || prop.matchName === "ADBE Vector Shape - Group") {
                            selectedGroups.push(prop);
                        }
                    }
                }
                
                // Determine target property groups whose children we want to explode
                var parentGroups = [];
                if (selectedGroups.length > 0) {
                    // Explode the contents inside each selected group
                    for (var g = 0; g < selectedGroups.length; g++) {
                        // The actual contents/items of an ADBE Vector Group are inside its "ADBE Vector Items Group" property
                        var itemsGroup = selectedGroups[g].property("ADBE Vector Items Group");
                        if (itemsGroup) {
                            parentGroups.push(itemsGroup);
                        } else {
                            parentGroups.push(selectedGroups[g]);
                        }
                    }
                } else {
                    // Default to exploding the root vectors group of the shape layer
                    var rootGroup = shapeLayer.property("ADBE Root Vectors Group");
                    if (rootGroup) {
                        parentGroups.push(rootGroup);
                    }
                }
                
                // Collect all child items and pre-calculate their property paths to prevent object invalidation
                var targetPaths = [];
                for (var pg = 0; pg < parentGroups.length; pg++) {
                    var parentGroup = parentGroups[pg];
                    for (var i = 1; i <= parentGroup.numProperties; i++) {
                        var prop = parentGroup.property(i);
                        if (prop.matchName !== "ADBE Vector Transform Group" && 
                            prop.matchName !== "ADBE Vector Group Transform" && 
                            prop.matchName !== "ADBE Vector Materials Group" &&
                            prop.matchName !== "ADBE Vector Blend Mode") {
                            
                            // Construct the path indices BEFORE duplicating
                            var pathIndices = [];
                            var cur = prop;
                            while (cur && cur !== shapeLayer) {
                                pathIndices.unshift(cur.propertyIndex);
                                cur = cur.parentProperty;
                            }
                            targetPaths.push({
                                name: prop.name,
                                path: pathIndices
                            });
                        }
                    }
                }
                
                if (targetPaths.length === 0) continue;
                
                // Explode each collected child item into a separate layer
                for (var i = 0; i < targetPaths.length; i++) {
                    var targetItem = targetPaths[i];
                    var pathIndices = targetItem.path;
                    
                    // Duplicate the original layer
                    var newLayer = shapeLayer.duplicate();
                    newLayer.name = shapeLayer.name + " - " + targetItem.name;
                    newSelectedLayers.push(newLayer);
                    
                    // Find the target property inside the duplicated layer
                    var targetInDup = newLayer;
                    for (var k = 0; k < pathIndices.length; k++) {
                        targetInDup = targetInDup.property(pathIndices[k]);
                    }
                    
                    if (targetInDup) {
                        // Isolate the target property by traversing up the parent chain
                        // and deleting all sibling properties at each level
                        var isolateCur = targetInDup;
                        while (isolateCur && isolateCur.parentProperty) {
                            var parent = isolateCur.parentProperty;
                            if (parent instanceof ShapeLayer) {
                                break;
                            }
                            
                            // If the parent is a container for shapes/graphics (root group or items group)
                            if (parent.matchName === "ADBE Root Vectors Group" || 
                                parent.matchName === "ADBE Vector Items Group") {
                                for (var j = parent.numProperties; j >= 1; j--) {
                                    var sibling = parent.property(j);
                                    if (sibling.propertyIndex !== isolateCur.propertyIndex) {
                                        // Keep transform, material, blend mode properties
                                        if (sibling.matchName !== "ADBE Vector Transform Group" && 
                                            sibling.matchName !== "ADBE Vector Group Transform" && 
                                            sibling.matchName !== "ADBE Vector Materials Group" &&
                                            sibling.matchName !== "ADBE Vector Blend Mode") {
                                            sibling.remove();
                                        }
                                    }
                                }
                            }
                            isolateCur = parent;
                        }
                    }
                    explodedLayersCount++;
                }
                
                // Hide the original layer
                shapeLayer.enabled = false;
            }
            
            if (explodedLayersCount === 0) {
                app.endUndoGroup();
                return MotionreisUtils.sendError("No shapes or groups found inside the selected Shape Layer to extract.");
            }
            
            // Select the new extracted layers in the timeline
            app.executeCommand(2004); // Deselect All
            for (var n = 0; n < newSelectedLayers.length; n++) {
                newSelectedLayers[n].selected = true;
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Berhasil mengekstrak " + explodedLayersCount + " shape layer baru.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError("Extraction failed: " + e.message);
        }
    },

    mergeShapeLayers: function() {
        try {
            app.beginUndoGroup("Merge Shape Layers");
            var comp = MotionreisUtils.getActiveComp();
            
            // Force focus on the composition viewer so timeline Copy/Paste command execution doesn't fail
            if (comp.openInViewer) {
                comp.openInViewer();
            }
            
            var layers = MotionreisUtils.getSelectedLayers(comp);
            var shapeLayers = [];
            for (var i = 0; i < layers.length; i++) {
                if (layers[i] instanceof ShapeLayer) shapeLayers.push(layers[i]);
            }
            
            if (shapeLayers.length < 2) return MotionreisUtils.sendError("Select at least 2 Shape Layers to merge.");
            
            // Calculate total time span (duration) and parenting from sources
            var minInPoint = 99999;
            var maxOutPoint = -99999;
            for (var i = 0; i < shapeLayers.length; i++) {
                if (shapeLayers[i].inPoint < minInPoint) minInPoint = shapeLayers[i].inPoint;
                if (shapeLayers[i].outPoint > maxOutPoint) maxOutPoint = shapeLayers[i].outPoint;
            }
            
            // Sort by index so we process from bottom to top (preserves visual z-depth stacking)
            shapeLayers.sort(function(a, b) { return b.index - a.index; });
            
            // Top source layer determines target parenting and label color
            var topSourceLayer = shapeLayers[shapeLayers.length - 1];
            
            var targetLayer = comp.layers.addShape();
            targetLayer.name = "Merged Shapes";
            targetLayer.moveBefore(topSourceLayer);
            targetLayer.inPoint = minInPoint;
            targetLayer.outPoint = maxOutPoint;
            if (topSourceLayer.parent) {
                targetLayer.parent = topSourceLayer.parent;
            }
            
            var targetGroup = targetLayer.property("ADBE Root Vectors Group");
            
            // Helper function to copy animations/keyframes flawlessly between shape properties
            function copyPropertyAnimation(srcProp, dstProp) {
                if (!srcProp || !dstProp) return;
                
                // Clear existing keys on destination
                while (dstProp.numKeys > 0) {
                    dstProp.removeKey(1);
                }
                
                if (srcProp.numKeys > 0) {
                    var keysData = [];
                    var isSpatial = (srcProp.propertyValueType === PropertyValueType.TwoD_SPATIAL || srcProp.propertyValueType === PropertyValueType.ThreeD_SPATIAL);
                    
                    for (var k = 1; k <= srcProp.numKeys; k++) {
                        keysData.push({
                            time: srcProp.keyTime(k),
                            value: srcProp.keyValue(k),
                            inType: srcProp.keyInInterpolationType(k),
                            outType: srcProp.keyOutInterpolationType(k),
                            inEase: (srcProp.keyInInterpolationType(k) === KeyframeInterpolationType.BEZIER || srcProp.keyOutInterpolationType(k) === KeyframeInterpolationType.BEZIER) ? srcProp.keyInTemporalEase(k) : null,
                            outEase: (srcProp.keyInInterpolationType(k) === KeyframeInterpolationType.BEZIER || srcProp.keyOutInterpolationType(k) === KeyframeInterpolationType.BEZIER) ? srcProp.keyOutTemporalEase(k) : null,
                            isSpatial: isSpatial,
                            inTangent: isSpatial ? srcProp.keyInSpatialTangent(k) : null,
                            outTangent: isSpatial ? srcProp.keyOutSpatialTangent(k) : null,
                            spatialAutoBezier: isSpatial ? srcProp.keySpatialAutoBezier(k) : false,
                            spatialContinuous: isSpatial ? srcProp.keySpatialContinuous(k) : false,
                            temporalContinuous: srcProp.keyTemporalContinuous(k)
                        });
                    }
                    
                    for (var k = 0; k < keysData.length; k++) {
                        var data = keysData[k];
                        var newIdx = dstProp.addKey(data.time);
                        dstProp.setValueAtKey(newIdx, data.value);
                        
                        dstProp.setInterpolationTypeAtKey(newIdx, data.inType, data.outType);
                        
                        if (data.inEase && data.outEase) {
                            dstProp.setTemporalEaseAtKey(newIdx, data.inEase, data.outEase);
                        }
                        
                        if (data.isSpatial) {
                            dstProp.setSpatialTangentsAtKey(newIdx, data.inTangent, data.outTangent);
                            dstProp.setSpatialAutoBezierAtKey(newIdx, data.spatialAutoBezier);
                            dstProp.setSpatialContinuousAtKey(newIdx, data.spatialContinuous);
                        }
                        
                        dstProp.setTemporalContinuousAtKey(newIdx, data.temporalContinuous);
                    }
                } else {
                    dstProp.setValue(srcProp.value);
                }
            }
            
            for (var i = 0; i < shapeLayers.length; i++) {
                var srcLayer = shapeLayers[i];
                var srcGroup = srcLayer.property("ADBE Root Vectors Group");
                
                if (srcGroup.numProperties === 0) {
                    srcLayer.enabled = false;
                    continue;
                }
                
                app.executeCommand(2004); // Deselect All
                
                // Create a container group for this layer's shapes
                var newGrp = targetGroup.addProperty("ADBE Vector Shape - Group");
                newGrp.name = srcLayer.name;
                
                // Select all items in source layer to prepare for copy
                srcLayer.selected = true;
                for (var j = 1; j <= srcGroup.numProperties; j++) {
                    srcGroup.property(j).selected = true;
                }
                
                app.executeCommand(19); // Copy
                app.executeCommand(2004); // Deselect All (guarantees clipboard target is clean)
                
                // Paste into new group inside merged layer
                targetLayer.selected = true;
                newGrp.selected = true;
                app.executeCommand(20); // Paste
                app.executeCommand(2004); // Deselect All
                
                // Flawlessly copy over layer transform animations to group-level vector transforms
                try {
                    var srcTransform = srcLayer.transform;
                    var grpTransform = newGrp.property("ADBE Vector Transform Group");
                    
                    copyPropertyAnimation(srcTransform.property("ADBE Anchor Point"), grpTransform.property("ADBE Vector Anchor"));
                    copyPropertyAnimation(srcTransform.property("ADBE Position"), grpTransform.property("ADBE Vector Position"));
                    copyPropertyAnimation(srcTransform.property("ADBE Scale"), grpTransform.property("ADBE Vector Scale"));
                    
                    var srcRot = srcTransform.property("ADBE Rotate Z") ? srcTransform.property("ADBE Rotate Z") : srcTransform.property("ADBE Rotation");
                    copyPropertyAnimation(srcRot, grpTransform.property("ADBE Vector Rotation"));
                    copyPropertyAnimation(srcTransform.property("ADBE Opacity"), grpTransform.property("ADBE Vector Group Opacity"));
                } catch(err) {}
                
                srcLayer.enabled = false; // Hide original
            }
            
            app.executeCommand(2004); // Deselect All
            targetLayer.selected = true;
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Berhasil merge " + shapeLayers.length + " layer menjadi 1.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },
    run: function(argsStr) {
        var args = JSON.parse(argsStr);
        
        if (args.action === 'batchRename') {
            return this.batchRename(args);
        }
        if (args.action === 'batchTrim') {
            return this.batchTrim(args);
        }
        if (args.action === 'autoCrop') {
            return this.autoCrop();
        }
        if (args.action === 'linkColors') {
            return this.linkColors(args);
        }
        if (args.action === 'groupLayers') return this.groupLayers();
        if (args.action === 'ungroupLayers') return this.ungroupLayers();
        if (args.action === 'primeClone') return this.primeClone();
        if (args.action === 'preRender') return this.preRender();
        if (args.action === 'deepDuplicateComp') return this.deepDuplicateComp();
        if (args.action === 'explodeShapeLayer') return this.explodeShapeLayer();
        if (args.action === 'mergeShapeLayers') return this.mergeShapeLayers();
        if (args.action === 'unlinkColors') return this.unlinkColors();
        
        return MotionreisUtils.sendError("Layers function not yet implemented.");
    }
};
