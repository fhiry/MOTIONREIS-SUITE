// Include utils
//@include "utils.jsx"

var creative = {
    // ---- TEXT ANIMATOR ----
    animateText: function(args) {
        try {
            app.beginUndoGroup("Text Animator");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var type = args.type || "fadeUp"; // "fadeUp", "typewriter"
            var animatedCount = 0;
            
            for (var i = 0; i < layers.length; i++) {
                var l = layers[i];
                if (!(l instanceof TextLayer)) continue;
                
                var textProp = l.property("ADBE Text Properties");
                var animators = textProp.property("ADBE Text Animators");
                
                var animator = animators.addProperty("ADBE Text Animator");
                animator.name = "Motionreis " + type;
                
                var selector = animator.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
                var properties = animator.property("ADBE Text Animator Properties");
                
                if (type === "fadeUp") {
                    properties.addProperty("ADBE Text Position 3D").setValue([0, 50, 0]);
                    properties.addProperty("ADBE Text Opacity").setValue(0);
                    
                    // Simple linear animation using expression on selector Start
                    selector.property("ADBE Text Index Start").setValue(0);
                    selector.property("ADBE Text Index End").setValue(100);
                    var offset = selector.property("ADBE Text Percent Offset");
                    offset.setValue(-100);
                    
                    // Add keyframes
                    var t = l.inPoint;
                    offset.setValueAtTime(t, -100);
                    offset.setValueAtTime(t + 1, 100); // 1 second animation
                    
                    // Add Ease
                    var easeIn = new KeyframeEase(0, 33);
                    var easeOut = new KeyframeEase(0, 66);
                    offset.setTemporalEaseAtKey(1, [easeIn], [easeOut]);
                    offset.setTemporalEaseAtKey(2, [easeIn], [easeOut]);
                    
                } else if (type === "typewriter") {
                    properties.addProperty("ADBE Text Opacity").setValue(0);
                    selector.property("ADBE Text Index Start").setValue(0);
                    var endProp = selector.property("ADBE Text Index End");
                    
                    var t = l.inPoint;
                    endProp.setValueAtTime(t, 0);
                    endProp.setValueAtTime(t + 2, 100);
                    
                } else if (type === "scramble") {
                    properties.addProperty("ADBE Text Character Offset").setValue(15);
                    var endProp = selector.property("ADBE Text Index End");
                    
                    var t = l.inPoint;
                    endProp.setValueAtTime(t, 0);
                    endProp.setValueAtTime(t + 1.5, 100);
                    
                } else if (type === "slideIn") {
                    properties.addProperty("ADBE Text Position 3D").setValue([-200, 0, 0]);
                    properties.addProperty("ADBE Text Opacity").setValue(0);
                    
                    var offset = selector.property("ADBE Text Percent Offset");
                    var t = l.inPoint;
                    offset.setValueAtTime(t, -100);
                    offset.setValueAtTime(t + 1, 100);
                }
                
                animatedCount++;
            }
            
            app.endUndoGroup();
            if (animatedCount === 0) return MotionreisUtils.sendError("Select at least 1 Text Layer.");
            return MotionreisUtils.sendResponse("Text Animator (" + type + ") applied to " + animatedCount + " text(s).");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- CAMERA TOOLS ----
    generateParallaxRig: function() {
        try {
            app.beginUndoGroup("Generate Parallax Camera Rig");
            var comp = MotionreisUtils.getActiveComp();
            
            // 1. Create Null
            var camNull = comp.layers.addNull();
            camNull.name = "Camera Controller";
            camNull.threeDLayer = true;
            camNull.label = 10; // Purple
            
            var centerX = comp.width / 2;
            var centerY = comp.height / 2;
            camNull.position.setValue([centerX, centerY, 0]);
            
            // 2. Create Camera
            var cam = comp.layers.addCamera("Main Camera", [centerX, centerY]);
            cam.position.setValue([centerX, centerY, -1500]);
            
            // Fix Auto-Orientation to point to POI (default for 2-node)
            cam.autoOrient = AutoOrientType.CAMERA_OR_POINT_OF_INTEREST;
            
            // 3. Parent
            cam.parent = camNull;
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("3D Camera Rig successfully created!");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },
    
    toggleCameraNode: function() {
        try {
            app.beginUndoGroup("Toggle Camera Nodes");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var cam = null;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i] instanceof CameraLayer) {
                    cam = layers[i];
                    break;
                }
            }
            if (!cam) return MotionreisUtils.sendError("Select a Camera Layer to toggle.");
            
            // Toggle Auto-Orient
            if (cam.autoOrient === AutoOrientType.CAMERA_OR_POINT_OF_INTEREST) {
                cam.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
                var res = "1-Node (Free)";
            } else {
                cam.autoOrient = AutoOrientType.CAMERA_OR_POINT_OF_INTEREST;
                var res = "2-Node (Focus on POI)";
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Camera changed to mode " + res);
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- AUDIO REACTIVE ----
    generateWaveform: function() {
        try {
            app.beginUndoGroup("Generate Waveform");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var audioLayer = null;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].hasAudio) {
                    audioLayer = layers[i];
                    break;
                }
            }
            
            if (!audioLayer) return MotionreisUtils.sendError("Select an audio layers (mp3/wav/mp4).");
            
            // Create Solid
            var solid = comp.layers.addSolid([1, 1, 1], "Audio Waveform", comp.width, comp.height, comp.pixelAspect, comp.duration);
            solid.startTime = 0;
            solid.moveBefore(audioLayer);
            
            // Cascading addition logic for extreme compatibility across AE versions/localizations
            var effect = null;
            var effectNames = ["ADBE Audio Waveform", "ADBE Audio Spectrum", "Audio Waveform", "Audio Spectrum"];
            var addError = "";
            for (var eIdx = 0; eIdx < effectNames.length; eIdx++) {
                try {
                    effect = solid.effect.addProperty(effectNames[eIdx]);
                    if (effect) break;
                } catch(err) {
                    addError = err.message;
                }
            }
            
            if (!effect) {
                return MotionreisUtils.sendError("Failed to add Waveform effect: " + addError);
            }
            
            // Safe property setter helper to prevent localization crashes
            function setSafeProperty(effectObj, propName, value) {
                try {
                    var prop = effectObj.property(propName);
                    if (prop) prop.setValue(value);
                } catch(e) {}
            }
            
            setSafeProperty(effect, "Audio Layer", audioLayer.index);
            setSafeProperty(effect, "Start Point", [comp.width * 0.2, comp.height / 2]);
            setSafeProperty(effect, "End Point", [comp.width * 0.8, comp.height / 2]);
            setSafeProperty(effect, "Maximum Height", 1500);
            setSafeProperty(effect, "Thickness", 5);
            setSafeProperty(effect, "Inside Color", [0, 1, 0.8, 1]); // Cyan
            setSafeProperty(effect, "Outside Color", [0, 0.5, 1, 1]); // Blue
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Audio Waveform successfully generated from layers " + audioLayer.name);
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    audioToKeyframes: function() {
        try {
            app.beginUndoGroup("Audio to Keyframes");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var audioLayer = null;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].hasAudio) {
                    audioLayer = layers[i];
                    break;
                }
            }
            
            if (!audioLayer) return MotionreisUtils.sendError("Select an audio layers to convert to keyframes.");
            
            // Ensure ONLY the audio layers is selected before executing menu command
            for (var i = 1; i <= comp.numLayers; i++) {
                comp.layers(i).selected = false;
            }
            audioLayer.selected = true;
            
            // In ExtendScript, the only way to natively "Convert Audio to Keyframes" without UI interaction
            // is actually to execute the menu command. 
            app.executeCommand(app.findMenuCommandId("Convert Audio to Keyframes"));
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Audio berhasil diconvert jadi Amplitude Null (cek layers paling atas).");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    addHandheldShake: function() {
        try {
            app.beginUndoGroup("Add Handheld Shake");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var cam = null;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i] instanceof CameraLayer) {
                    cam = layers[i];
                    break;
                }
            }
            
            if (!cam) return MotionreisUtils.sendError("Select a Camera Layer to apply shake effect.");
            
            // Add sliders
            var freqSlider = cam.effect.addProperty("ADBE Slider Control");
            freqSlider.name = "Shake Frequency";
            freqSlider.property("Slider").setValue(2);
            
            var ampSlider = cam.effect.addProperty("ADBE Slider Control");
            ampSlider.name = "Shake Amplitude";
            ampSlider.property("Slider").setValue(15);
            
            // Apply wiggle
            var wiggleExpr = 'var freq = effect("Shake Frequency")("Slider");\n' +
                             'var amp = effect("Shake Amplitude")("Slider");\n' +
                             'wiggle(freq, amp);';
                             
            cam.position.expression = wiggleExpr;
            
            // if it has point of interest, wiggle that too slightly differently so it's not parallel
            if (cam.property("ADBE Transform Group").property("ADBE Anchor Point").canSetExpression) {
                cam.property("ADBE Transform Group").property("ADBE Anchor Point").expression = 'var freq = effect("Shake Frequency")("Slider");\n' +
                                                 'var amp = effect("Shake Amplitude")("Slider") * 1.5;\n' +
                                                 'wiggle(freq, amp);';
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Handheld Shake effect successfully applied to " + cam.name);
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // ---- TYPOGRAPHY & LAYOUT ----
    autoTextBox: function() {
        try {
            app.beginUndoGroup("Auto Text Box");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var textLayer = null;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i] instanceof TextLayer) {
                    textLayer = layers[i];
                    break;
                }
            }
            
            if (!textLayer) return MotionreisUtils.sendError("Select at least 1 Text Layer to apply Text Box.");
            
            // Create shape layers
            var boxLayer = comp.layers.addShape();
            boxLayer.name = textLayer.name + " Box";
            
            // Add Rectangle
            var contents = boxLayer.property("ADBE Root Vectors Group");
            var rect = contents.addProperty("ADBE Vector Shape - Rect");
            var fill = contents.addProperty("ADBE Vector Graphic - Fill");
            fill.property("ADBE Vector Fill Color").setValue([0.1, 0.1, 0.1]); // Dark gray
            
            // Link Size
            var sizeExpr = "var padX = 40;\n" +
                           "var padY = 20;\n" +
                           "var t = thisComp.layer('" + textLayer.name.replace(/'/g, "\\'") + "');\n" +
                           "var r = t.sourceRectAtTime(time, false);\n" +
                           "[r.width + padX, r.height + padY];";
            rect.property("ADBE Vector Rect Size").expression = sizeExpr;
            
            // Link Position
            var posExpr = "var t = thisComp.layer('" + textLayer.name.replace(/'/g, "\\'") + "');\n" +
                          "var r = t.sourceRectAtTime(time, false);\n" +
                          "var p = t.toComp([r.left + r.width/2, r.top + r.height/2]);\n" +
                          "fromComp(p);";
            boxLayer.property("ADBE Transform Group").property("ADBE Position").expression = posExpr;
            
            // Lock scale so user doesn't break it
            boxLayer.property("ADBE Transform Group").property("ADBE Scale").expression = "[100,100]";
            
            // Add sliders for padding to the box layers
            var effectsGroup = boxLayer.property("ADBE Effect Parade");
            var fxPadX = effectsGroup.addProperty("ADBE Slider Control");
            fxPadX.name = "Padding X";
            fxPadX.property("Slider").setValue(40);
            
            var fxPadY = effectsGroup.addProperty("ADBE Slider Control");
            fxPadY.name = "Padding Y";
            fxPadY.property("Slider").setValue(20);
            
            // Update size expression to use sliders
            sizeExpr = "var padX = effect('Padding X')('Slider');\n" +
                       "var padY = effect('Padding Y')('Slider');\n" +
                       "var t = thisComp.layer('" + textLayer.name.replace(/'/g, "\\'") + "');\n" +
                       "var r = t.sourceRectAtTime(time, false);\n" +
                       "[r.width + padX, r.height + padY];";
            rect.property("ADBE Vector Rect Size").expression = sizeExpr;
            
            // Move layer at the very end to prevent "Object is invalid" error
            boxLayer.moveAfter(textLayer);
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Auto Text Box created for " + textLayer.name);
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    splitText: function(args) {
        try {
            app.beginUndoGroup("Split Text");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            var textLayer = null;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i] instanceof TextLayer) {
                    textLayer = layers[i];
                    break;
                }
            }
            
            if (!textLayer) return MotionreisUtils.sendError("Select 1 Text Layer to split.");
            
            var txtProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
            var txtDoc = txtProp.value;
            var str = txtDoc.text;
            
            var parts = [];
            if (args.mode === "words") {
                parts = str.split(/\\s+/);
            } else {
                parts = str.split("");
            }
            
            if (parts.length <= 1) return MotionreisUtils.sendError("Text is too short to split.");
            
            // Mute original
            textLayer.enabled = false;
            
            // To make it exact without complex math, we duplicate the layers N times
            // and use a Text Animator with Opacity=0 to hide everything except the target word/char.
            var created = 0;
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === "" || parts[i] === " ") continue;
                
                var dup = textLayer.duplicate();
                dup.enabled = true;
                dup.name = parts[i];
                
                var animators = dup.property("ADBE Text Properties").property("ADBE Text Animators");
                var animator = animators.addProperty("ADBE Text Animator");
                animator.name = "Isolate Part";
                
                var props = animator.property("ADBE Text Animator Properties");
                props.addProperty("ADBE Text Opacity").setValue(0);
                
                var selector = animator.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
                // Advanced settings
                var advanced = selector.property("ADBE Text Index Options");
                if (args.mode === "words") {
                    advanced.property("ADBE Text Index Based On").setValue(2); // 2 = Words
                } else {
                    advanced.property("ADBE Text Index Based On").setValue(1); // 1 = Characters
                }
                
                // We want to hide everything EXCEPT the target index.
                // Start = index, End = index + 1
                // Mode = Subtract
                selector.property("ADBE Text Index Start").setValue(i);
                selector.property("ADBE Text Index End").setValue(i + 1);
                selector.property("ADBE Text Index Units").setValue(2); // 2 = Index
                advanced.property("ADBE Text Selector Mode").setValue(3); // 3 = Subtract
                
                created++;
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Text successfully split into " + created + " layers.");
        } catch(e) {
            app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // Router function called from UI
    run: function(argsStr) {
        var args = MotionreisUtils.safeParse(argsStr);
        
        if (args.action === 'animateText') {
            return this.animateText(args);
        }
        if (args.action === 'generateParallaxRig') {
            return this.generateParallaxRig();
        }
        if (args.action === 'generateWaveform') {
            return this.generateWaveform();
        }
        if (args.action === 'audioToKeyframes') return this.audioToKeyframes();
        if (args.action === 'addHandheldShake') return this.addHandheldShake();
        if (args.action === 'toggleCameraNode') return this.toggleCameraNode();
        
        if (args.action === 'autoTextBox') return this.autoTextBox();
        if (args.action === 'splitText') return this.splitText(args);
        
        return MotionreisUtils.sendError("Creative function not yet implemented.");
    }
};
