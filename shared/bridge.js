// Bridge for AE ExtendScript communication
const csInterface = new CSInterface();

const Bridge = {
    // Cache of already-loaded JSX modules
    _loadedModules: {},

    // Load a JSX file from the jsx folder (only loads once per session).
    // Returns a Promise that resolves when the JSX is fully evaluated.
    // If already loaded, resolves immediately.
    loadJSX: function(fileName) {
        if (this._loadedModules[fileName]) return Promise.resolve(false);
        this._loadedModules[fileName] = true;
        const extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
        return new Promise((resolve) => {
            csInterface.evalScript(`$.evalFile("${extensionRoot}${fileName}"); "loaded:${fileName}"`, (res) => {
                resolve(true); // JSX is confirmed evaluated
            });
        });
    },

    // Execute an ExtendScript function and parse JSON response
    eval: function(scriptString) {
        return new Promise((resolve, reject) => {
            csInterface.evalScript(scriptString, (res) => {
                try {
                    if (res === "EvalScript error.") {
                        reject(new Error("ExtendScript evaluation failed."));
                        return;
                    }
                    if (!res || res === "undefined") {
                        resolve(null);
                        return;
                    }
                    const parsed = JSON.parse(res);
                    if (parsed && parsed.error) {
                        reject(new Error(parsed.error));
                    } else {
                        resolve(parsed.data !== undefined ? parsed.data : parsed);
                    }
                } catch (e) {
                    // Not valid JSON, return as string
                    resolve(res);
                }
            });
        });
    },
    
    // Call a specific module function with stringified arguments
    callMethod: function(moduleObj, methodName, args) {
        const argsStr = args ? JSON.stringify(args).replace(/\\/g, '\\\\').replace(/"/g, '\\"') : "";
        const script = `${moduleObj}.${methodName}("${argsStr}")`;
        return this.eval(script);
    }
};

// UI Utils (Tabs)
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const modules = document.querySelectorAll('.module-container');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            modules.forEach(m => m.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}
