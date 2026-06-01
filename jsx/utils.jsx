// Global Utility Functions for ExtendScript

var MotionreisUtils = {
    // Get active composition
    getActiveComp: function() {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            throw new Error("Tolong buka dan aktifkan komposisi terlebih dahulu.");
        }
        return comp;
    },

    // Get selected layers
    getSelectedLayers: function(comp) {
        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) {
            throw new Error("Pilih setidaknya satu layer.");
        }
        return layers;
    },

    // Standard Response Wrapper
    sendResponse: function(data) {
        return JSON.stringify({ ok: true, data: data });
    },

    // Safe JSON parse wrapper
    safeParse: function(str) {
        try {
            if (!str) return {};
            return JSON.parse(str);
        } catch(e) {
            return {};
        }
    },

    // Standard Error Wrapper
    sendError: function(message) {
        return JSON.stringify({ ok: false, error: message });
    },

    // Context-Aware Display Endpoint
    getContext: function() {
        try {
            var comp = app.project ? app.project.activeItem : null;
            if (!comp || !(comp instanceof CompItem)) {
                return MotionreisUtils.sendResponse({ valid: false });
            }
            var layers = comp.selectedLayers || [];
            var types = {
                text: false, audio: false, camera: false, shape: false, nullObj: false, precomp: false
            };
            for (var i = 0; i < layers.length; i++) {
                var l = layers[i];
                if (l instanceof TextLayer) types.text = true;
                else if (l instanceof CameraLayer) types.camera = true;
                else if (l instanceof ShapeLayer) types.shape = true;
                else if (l.nullLayer) types.nullObj = true;
                else if (l.source && l.source instanceof CompItem) types.precomp = true;
                else if (l.hasAudio) types.audio = true;
            }
            return MotionreisUtils.sendResponse({
                valid: true,
                selectedCount: layers.length,
                compName: comp.name,
                types: types
            });
        } catch(e) {
            return MotionreisUtils.sendError(e.message);
        }
    }
};
