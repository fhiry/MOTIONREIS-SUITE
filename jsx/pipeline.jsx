// Include utils
//@include "utils.jsx"

var pipeline = {
    runBackup: function(argsStr) {
        try {
            // Define source data folder (inside extension directory)
            var extensionRoot = new File($.fileName).parent.parent;
            var dataFolder = new Folder(extensionRoot.fsName + "/data");
            
            if (!dataFolder.exists) {
                dataFolder.create();
            }
            
            // Define Backup Folder in Documents
            var docsFolder = Folder.myDocuments;
            var backupFolder = new Folder(docsFolder.fsName + "/Motionreis_Backups/Data_Backup");
            if (!backupFolder.exists) {
                backupFolder.create(); // Create parent Motionreis_Backups if needed, and Data_Backup
            }
            
            // Create timestamp YYYY-MM-DD_HH-MM
            var d = new Date();
            var ts = d.getFullYear() + "-" + 
                     ("0"+(d.getMonth()+1)).slice(-2) + "-" + 
                     ("0"+d.getDate()).slice(-2) + "_" + 
                     ("0"+d.getHours()).slice(-2) + "-" + 
                     ("0"+d.getMinutes()).slice(-2);
                     
            var currentBackupFolder = new Folder(backupFolder.fsName + "/Backup_" + ts);
            currentBackupFolder.create();
            
            // Get all json files in data folder
            var files = dataFolder.getFiles("*.json");
            var copiedCount = 0;
            
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (file instanceof File) {
                    var targetFile = new File(currentBackupFolder.fsName + "/" + file.name);
                    if (file.copy(targetFile)) {
                        copiedCount++;
                    }
                }
            }
            
            
            return MotionreisUtils.sendResponse("Successfully backed up " + copiedCount + " data files (presets, configs) to Documents.");
            
        } catch(e) {
            return MotionreisUtils.sendError(e.message);
        }
    },

    getAESettingsPaths: function() {
        try {
            var major = app.version.split(".")[0];
            var minor = app.version.split(".")[1];
            var possibleVersions = [major + "." + minor, major + ".0", major + ".1", major + ".2"];
            var isMac = (Folder.fs === "Macintosh");
            var basePath = isMac ? (Folder.myDocuments.parent.fsName + "/Library/Preferences/Adobe/After Effects") : (Folder.userData.fsName + "/Adobe/After Effects");
            
            var prefFolder = null;
            var actualVersion = major + ".0";
            
            for (var i = 0; i < possibleVersions.length; i++) {
                var testFolder = new Folder(basePath + "/" + possibleVersions[i]);
                if (testFolder.exists) {
                    prefFolder = testFolder;
                    actualVersion = possibleVersions[i];
                    break;
                }
            }
            
            if (!prefFolder) {
                prefFolder = new Folder(basePath + "/" + major + ".0");
            }
            
            var userPresetsFolder = new Folder(Folder.myDocuments.fsName + "/Adobe/After Effects " + actualVersion + "/User Presets");
            if (!userPresetsFolder.exists) {
                userPresetsFolder = new Folder(Folder.myDocuments.fsName + "/Adobe/After Effects " + major + ".0/User Presets");
            }
            
            var paths = {
                majorVersion: actualVersion,
                prefFolderPath: prefFolder.exists ? prefFolder.fsName : "",
                modifiedWorkspacesPath: new Folder(prefFolder.fsName + "/ModifiedWorkspaces").exists ? prefFolder.fsName + "/ModifiedWorkspaces" : "",
                userPresetsPath: userPresetsFolder.exists ? userPresetsFolder.fsName : ""
            };
            
            return MotionreisUtils.sendResponse(paths);
        } catch(e) {
            return MotionreisUtils.sendError(e.message);
        }
    },

    purgeCache: function() {
        try {
            app.purge(PurgeTarget.ALL_CACHES);
            return MotionreisUtils.sendResponse('All Memory & Disk Caches Purged.');
        } catch(e) {
            return MotionreisUtils.sendError(e.message);
        }
    },

    // -----------------------------------------------------------------------------------
    // PROJECT ORGANIZER (AE PANEL)
    // -----------------------------------------------------------------------------------
    organizeProject: function(argsStr) {
        try {
            app.beginUndoGroup("Organize Project Panel");
            if (!app.project) return MotionreisUtils.sendError("No project open.");

            var proj = app.project;
            
            var struct = {
                "01_ASSET": ["3D", "PSD", "PNG", "AI", "JPEG"],
                "02_AUDIO": ["SCORING", "SFX", "MUSIC", "VO", "FMIX"],
                "03_EXPORT": [],
                "04_IMAGE": ["PSD", "PNG", "AI", "JPEG", "TIFF"],
                "05_BRIEF": [],
                "06_COMP": ["MAIN", "PRECOMP"],
                "07_CG": [],
                "08_VIDEO DATA": ["PRORESS", "REPORT", "RAW"]
            };
            
            var folders = {};
            
            function getOrCreateFolder(name, parentObj) {
                for (var i = 1; i <= proj.numItems; i++) {
                    if (proj.item(i) instanceof FolderItem && proj.item(i).name === name && proj.item(i).parentFolder === parentObj) {
                        return proj.item(i);
                    }
                }
                var newFolder = proj.items.addFolder(name);
                newFolder.parentFolder = parentObj;
                return newFolder;
            }
            

            // Build Structure
            for (var rootKey in struct) {
                var rFolder = getOrCreateFolder(rootKey, proj.rootFolder);
                folders[rootKey] = rFolder;
                var subs = struct[rootKey];
                for (var i=0; i<subs.length; i++) {
                    folders[rootKey + "_" + subs[i]] = getOrCreateFolder(subs[i], rFolder);
                }
            }
            
            function isIgnored(item) {
                var curr = item;
                while (curr) {
                    var lowerName = curr.name.toLowerCase();
                    if (lowerName.indexOf("-") === 0) return true;
                    if (lowerName.indexOf("export") !== -1) return true;
                    
                    if (curr === proj.rootFolder) break;
                    curr = curr.parentFolder;
                }
                return false;
            }

            var itemsToMove = [];
            for (var i = 1; i <= proj.numItems; i++) {
                if (!isIgnored(proj.item(i))) {
                    itemsToMove.push(proj.item(i));
                }
            }
            
            for (var i = 0; i < itemsToMove.length; i++) {
                var item = itemsToMove[i];
                var dest = null;
                
                if (item instanceof CompItem) {
                    if (item.usedIn.length > 0) {
                        dest = folders["06_COMP_PRECOMP"];
                    } else {
                        dest = folders["06_COMP_MAIN"];
                    }
                } else if (item instanceof FootageItem && item.mainSource) {
                    if (item.mainSource instanceof SolidSource) {
                        dest = folders["01_ASSET"];
                    } else if (item.mainSource.file) {
                        var ext = item.name.toLowerCase().split('.').pop();
                        if (ext === "psd") dest = folders["01_ASSET_PSD"];
                        else if (ext === "png") dest = folders["01_ASSET_PNG"];
                        else if (ext === "jpg" || ext === "jpeg") dest = folders["01_ASSET_JPEG"];
                        else if (ext === "ai" || ext === "eps") dest = folders["01_ASSET_AI"];
                        else if (ext === "wav" || ext === "mp3" || ext === "aac" || ext === "m4a") dest = folders["02_AUDIO_SFX"];
                        else if (ext === "mp4" || ext === "mov" || ext === "avi" || ext === "mxf") dest = folders["08_VIDEO DATA_RAW"];
                        else dest = folders["01_ASSET"];
                    }
                } else if (item instanceof FolderItem) {
                    // Check if it's one of our master folders
                    var isMaster = false;
                    for (var k in folders) {
                        if (item === folders[k]) { isMaster = true; break; }
                    }
                    if (!isMaster) {
                        dest = folders["01_ASSET"]; // Move Solids and other custom folders to ASSET
                    }
                }
                
                if (dest && item.parentFolder !== dest) {
                    item.parentFolder = dest;
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Project Panel successfully organized following master folder structure!");
            
        } catch(e) {
            if(app) app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },
    
    // -----------------------------------------------------------------------------------
    // PROJECT ORGANIZER (PR PANEL)
    // -----------------------------------------------------------------------------------
    prOrganizeProject: function(argsStr) {
        try {
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            
            var proj = app.project;
            
            var struct = {
                "01_ASSET": ["3D", "PSD", "PNG", "AI", "JPEG"],
                "02_AUDIO": ["SCORING", "SFX", "MUSIC", "VO", "FMIX"],
                "03_EXPORT": [],
                "04_IMAGE": ["PSD", "PNG", "AI", "JPEG", "TIFF"],
                "05_BRIEF": [],
                "06_SEQUENCE": ["MAIN", "PRECOMP", "NEST"],
                "07_CG": [],
                "08_VIDEO DATA": ["PRORESS", "REPORT", "RAW"]
            };
            
            var folders = {};
            
            function getOrCreateBin(name, parentBin) {
                var children = parentBin.children;
                for (var i = 0; i < children.numItems; i++) {
                    var child = children[i];
                    if (child.type === ProjectItemType.BIN && child.name === name) {
                        return child;
                    }
                }
                return parentBin.createBin(name);
            }

            // Build Structure
            for (var rootKey in struct) {
                var rBin = getOrCreateBin(rootKey, proj.rootItem);
                folders[rootKey] = rBin;
                var subs = struct[rootKey];
                for (var i=0; i<subs.length; i++) {
                    folders[rootKey + "_" + subs[i]] = getOrCreateBin(subs[i], rBin);
                }
            }
            
            function isIgnored(item) {
                if (item.treePath) {
                    var lowerPath = item.treePath.toLowerCase();
                    if (lowerPath.indexOf("\\-") !== -1 || lowerPath.indexOf("/-") !== -1 || lowerPath.indexOf("export") !== -1) return true;
                }
                var lowerName = item.name.toLowerCase();
                if (lowerName.indexOf("-") === 0) return true;
                if (lowerName.indexOf("export") !== -1) return true;
                return false;
            }

            var itemsToMove = [];
            
            // Recursive function to gather all items
            function gatherItems(bin) {
                var children = bin.children;
                for (var i = 0; i < children.numItems; i++) {
                    var child = children[i];
                    if (!isIgnored(child)) {
                        itemsToMove.push(child);
                    }
                    if (child.type === ProjectItemType.BIN && !isIgnored(child)) {
                        gatherItems(child);
                    }
                }
            }
            
            gatherItems(proj.rootItem);
            
            for (var i = 0; i < itemsToMove.length; i++) {
                var item = itemsToMove[i];
                var dest = null;
                
                if (item.type === ProjectItemType.BIN) {
                    var isMaster = false;
                    for (var k in folders) {
                        if (item.nodeId === folders[k].nodeId) { isMaster = true; break; }
                    }
                    if (!isMaster) {
                        dest = folders["01_ASSET"];
                    }
                } else if (item.type === ProjectItemType.CLIP) {
                    if (item.isSequence()) {
                        dest = folders["06_SEQUENCE_MAIN"];
                    } else {
                        var mediaPath = item.getMediaPath();
                        if (mediaPath) {
                            var ext = mediaPath.toLowerCase().split('.').pop();
                            if (ext === "psd") dest = folders["01_ASSET_PSD"];
                            else if (ext === "png") dest = folders["01_ASSET_PNG"];
                            else if (ext === "jpg" || ext === "jpeg") dest = folders["01_ASSET_JPEG"];
                            else if (ext === "ai" || ext === "eps") dest = folders["01_ASSET_AI"];
                            else if (ext === "wav" || ext === "mp3" || ext === "aac" || ext === "m4a") dest = folders["02_AUDIO_SFX"];
                            else if (ext === "mp4" || ext === "mov" || ext === "avi" || ext === "mxf") dest = folders["08_VIDEO DATA_RAW"];
                            else dest = folders["01_ASSET"];
                        } else {
                            dest = folders["01_ASSET"];
                        }
                    }
                }
                
                if (dest && item.nodeId !== dest.nodeId) {
                    try {
                        item.moveBin(dest);
                    } catch(err) {}
                }
            }
            
            return MotionreisUtils.sendResponse("Premiere Pro Project Panel successfully organized!");
            
        } catch(e) {
            return MotionreisUtils.sendError("PR Organize Error: " + e.message);
        }
    },

    // -----------------------------------------------------------------------------------
    // AI LOADER (PR PANEL)
    // -----------------------------------------------------------------------------------
    prGetFolderFootage: function(argsStr) {
        try {
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            if (!app.project.activeSequence) return MotionreisUtils.sendError("No active sequence found. Please open an empty sequence first.");
            
            var proj = app.project;
            var groups = {};
            
            function gather(bin, currentPath) {
                var children = bin.children;
                if (!children) return;
                for (var i = 0; i < children.numItems; i++) {
                    var child = children[i];
                    if (child.type === ProjectItemType.BIN) {
                        var nextPath = currentPath ? currentPath + "/" + child.name : child.name;
                        gather(child, nextPath);
                    } else if (child.type === ProjectItemType.CLIP && !child.isSequence()) {
                        var parentPath = currentPath || "Root";
                        if (!groups[parentPath]) groups[parentPath] = [];
                        
                        var duration = 0;
                        try {
                            duration = child.getOutPoint().seconds - child.getInPoint().seconds;
                        } catch(e) {}
                        
                        groups[parentPath].push({
                            id: child.nodeId,
                            name: child.name,
                            duration: duration
                        });
                    }
                }
            }
            
            gather(proj.rootItem, "");
            
            return MotionreisUtils.sendResponse(groups);
        } catch(e) {
            return MotionreisUtils.sendError(e.message);
        }
    },
    
    prBuildAISequence: function(argsStr) {
        try {
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            var seq = app.project.activeSequence;
            if (!seq) return MotionreisUtils.sendError("Active sequence lost.");
            
            var args = MotionreisUtils.safeParse(argsStr);
            var groupedFootage = args.groupedFootage;
            var labels = args.labels;
            var addMarkers = args.addMarkers;
            
            var proj = app.project;
            
            function findItem(nodeId, bin) {
                var children = bin.children;
                for (var i = 0; i < children.numItems; i++) {
                    var child = children[i];
                    if (child.nodeId === nodeId) return child;
                    if (child.type === ProjectItemType.BIN) {
                        var res = findItem(nodeId, child);
                        if (res) return res;
                    }
                }
                return null;
            }
            
            function getClipDimensions(projectItem) {
                try {
                    if (!projectItem) return null;
                    if (ExternalObject.AdobeXMPScript === undefined) {
                        ExternalObject.AdobeXMPScript = new ExternalObject("lib:AdobeXMPScript");
                    }
                    var xmpString = projectItem.getProjectMetadata();
                    if (!xmpString) return null;
                    var xmp = new XMPMeta(xmpString);
                    var PProMetaURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
                    if (xmp.doesPropertyExist(PProMetaURI, "Column.Intrinsic.VideoInfo")) {
                        var info = xmp.getProperty(PProMetaURI, "Column.Intrinsic.VideoInfo").value;
                        var parts = info.split('x');
                        if (parts.length >= 2) {
                            var w = parseInt(parts[0].replace(/[^0-9]/g, ''), 10);
                            var h = parseInt(parts[1].split('(')[0].replace(/[^0-9]/g, ''), 10);
                            if (w > 0 && h > 0) return { width: w, height: h };
                        }
                    }
                } catch(e) {}
                return null;
            }

            var seqW = 0, seqH = 0;
            try {
                if (seq.frameSizeHorizontal) seqW = seq.frameSizeHorizontal;
                if (seq.frameSizeVertical) seqH = seq.frameSizeVertical;
                if (!seqW && seq.getSettings) {
                    var s = seq.getSettings();
                    seqW = s.videoFrameWidth;
                    seqH = s.videoFrameHeight;
                }
            } catch(e) {}
            
            var currentSecs = 0;
            if (seq.videoTracks.numTracks > 0 && seq.videoTracks[0].clips.numItems > 0) {
                var lastClip = seq.videoTracks[0].clips[seq.videoTracks[0].clips.numItems - 1];
                currentSecs = lastClip.end.seconds;
            } else if (seq.audioTracks.numTracks > 0 && seq.audioTracks[0].clips.numItems > 0) {
                var lastAudio = seq.audioTracks[0].clips[seq.audioTracks[0].clips.numItems - 1];
                currentSecs = lastAudio.end.seconds;
            }
            
            var gapSecs = 120; // 2 minutes gap
            var colorIndex = 0;
            
            for (var path in groupedFootage) {
                var clips = groupedFootage[path];
                var label = labels[path] || path.split('/').pop();
                
                var startSecs = currentSecs;
                
                for (var i = 0; i < clips.length; i++) {
                    var item = findItem(clips[i].id, proj.rootItem);
                    if (item) {
                        try {
                            var ticks = Math.round(currentSecs * 254016000000).toString();
                            var inserted = false;
                            var insertedTrack = null;
                            try {
                                if (seq.videoTracks.numTracks > 0) {
                                    seq.videoTracks[0].insertClip(item, ticks);
                                    inserted = true;
                                    insertedTrack = seq.videoTracks[0];
                                }
                            } catch(e) {}
                            
                            if (!inserted) {
                                try {
                                    if (seq.audioTracks.numTracks > 0) {
                                        seq.audioTracks[0].insertClip(item, ticks);
                                        inserted = true;
                                    }
                                } catch(e) {}
                            }
                            
                            if (inserted && insertedTrack && seqW > 0 && seqH > 0) {
                                try {
                                    var insertedClip = insertedTrack.clips[insertedTrack.clips.numItems - 1];
                                    if (insertedClip) {
                                        var dims = getClipDimensions(item);
                                        if (dims && dims.width > 0 && dims.height > 0) {
                                            var scaleW = (seqW / dims.width) * 100;
                                            var scaleH = (seqH / dims.height) * 100;
                                            var finalScale = Math.min(scaleW, scaleH);
                                            if (Math.abs(finalScale - 100) > 1) {
                                                for (var c = 0; c < insertedClip.components.numItems; c++) {
                                                    var comp = insertedClip.components[c];
                                                    if (comp.displayName === "Motion") {
                                                        for (var p = 0; p < comp.properties.numItems; p++) {
                                                            var prop = comp.properties[p];
                                                            if (prop.displayName === "Scale") {
                                                                prop.setValue(finalScale, true);
                                                                break;
                                                            }
                                                        }
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } catch(e) {}
                            }
                            
                            if (inserted) {
                                var d = item.getOutPoint().seconds - item.getInPoint().seconds;
                                currentSecs += d;
                            }
                        } catch(e) {}
                    }
                }
                
                if (addMarkers && currentSecs > startSecs) {
                    var m = seq.markers.createMarker(startSecs);
                    if (m) {
                        m.name = label;
                        m.end = currentSecs;
                        try { m.setColorByIndex(colorIndex); } catch(e) {}
                    }
                }
                
                if (currentSecs > startSecs) {
                    currentSecs += gapSecs;
                    colorIndex = (colorIndex + 1) % 8;
                }
            }
            
            return MotionreisUtils.sendResponse({ success: true });
        } catch(e) {
            return MotionreisUtils.sendError("PR Build Error: " + e.message);
        }
    },
    prDeleteDisabledClips: function(argsStr) {
        try {
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            var seq = app.project.activeSequence;
            if (!seq) return MotionreisUtils.sendError("No active sequence.");

            var args = argsStr ? MotionreisUtils.safeParse(argsStr) : {};
            var useRipple = args.ripple === true;

            var deletedCount = 0;

            function processTracks(tracks) {
                for (var i = 0; i < tracks.numTracks; i++) {
                    var track = tracks[i];
                    for (var j = track.clips.numItems - 1; j >= 0; j--) {
                        var clip = track.clips[j];
                        if (clip.disabled === true) {
                            try {
                                clip.remove(useRipple ? 1 : 0, 0);
                                deletedCount++;
                            } catch(e) {}
                        }
                    }
                }
            }

            processTracks(seq.videoTracks);
            processTracks(seq.audioTracks);

            return MotionreisUtils.sendResponse({ success: true, count: deletedCount, message: "Deleted " + deletedCount + " disabled clips" + (useRipple ? " (Ripple)." : ".") });
        } catch(e) {
            return MotionreisUtils.sendError("Error deleting clips: " + e.message);
        }
    },
    prExecuteScript: function(argsStr) {
        try {
            var args = argsStr ? MotionreisUtils.safeParse(argsStr) : {};
            if (!args.code) return MotionreisUtils.sendError("No code provided.");
            
            // Execute the code
            // Wrap the code in an IIFE to support the 'return' statement correctly inside eval.
            var wrappedCode = "(function(){\n" + args.code + "\n})();";
            var result = eval(wrappedCode);
            var msg = "Script executed successfully.";
            if (result !== undefined) msg += " Result: " + result;
            
            return MotionreisUtils.sendResponse({ success: true, message: msg });
        } catch(e) {
            return MotionreisUtils.sendError("Script Error: " + e.message + " (Line: " + e.line + ")");
        }
    },
    selectGenericFolder: function() {
        try {
            var targetFolder = Folder.selectDialog("Select Folder:");
            if (!targetFolder) return MotionreisUtils.sendResponse("Cancelled.");
            
            // Return special payload with the selected path
            return MotionreisUtils.sendResponse({ path: targetFolder.fsName });
        } catch(e) {
            return MotionreisUtils.sendError(e.message);
        }
    },

    selectOSFolder: function() {
        try {
            if (app && app.project && !app.project.file) {
                return MotionreisUtils.sendError("You must save your project first!");
            }
            
            // Auto-save project first so no unsaved changes are lost
            if (app && app.project && app.project.file) {
                app.project.save();
            }
            
            var targetFolder = Folder.selectDialog("Select main folder to organize:");
            if (!targetFolder) return MotionreisUtils.sendResponse("Cancelled.");
            
            // Return special payload with the selected path
            return MotionreisUtils.sendResponse({ path: targetFolder.fsName });
        } catch(e) {
            return MotionreisUtils.sendError(e.message);
        }
    },
    
    osOrganizeProject: function(argsStr) {
        try {
            var args = MotionreisUtils.safeParse(argsStr);
            var targetFolderPath = args.path;
            var targetFolder = new Folder(targetFolderPath);
            
            if (!targetFolder.exists) return MotionreisUtils.sendError("Folder not found.");
            
            var struct = {
                "01_ASSET": ["3D", "PSD", "PNG", "AI", "JPEG", "OTHER"],
                "02_AUDIO": ["SCORING", "SFX", "MUSIC", "VO", "FMIX"],
                "03_EXPORT": [],
                "04_IMAGE": ["PSD", "PNG", "AI", "JPEG", "TIFF"],
                "05_BRIEF": [],
                "06_PROJECT": ["AE", "FCPX", "PR"],
                "07_CG": [],
                "08_VIDEO DATA": ["PRORESS", "REPORT", "RAW"]
            };
            
            var osFolders = {};
            for (var rootKey in struct) {
                var rFolder = new Folder(targetFolder.fsName + "/" + rootKey);
                if (!rFolder.exists) rFolder.create();
                osFolders[rootKey] = rFolder;
                
                var subs = struct[rootKey];
                for (var i=0; i<subs.length; i++) {
                    var sFolder = new Folder(rFolder.fsName + "/" + subs[i]);
                    if (!sFolder.exists) sFolder.create();
                    osFolders[rootKey + "_" + subs[i]] = sFolder;
                }
            }
            
            var movedCount = 0;
            var isMac = $.os.toLowerCase().indexOf("mac") !== -1;
            var movedCurrentAep = false;
            
            // Gather all loose files and non-standard folders lying in the root of the selected target folder on disk,
            // and check if they are imported in After Effects to auto-relink them.
            var filesToMove = [];
            var foldersToMove = [];
            var filesSeen = {};
            
            var diskFiles = targetFolder.getFiles();
            for (var i = 0; i < diskFiles.length; i++) {
                var f = diskFiles[i];
                if (f instanceof File) {
                    var pathKey = f.fsName.toLowerCase();
                    if (!filesSeen[pathKey]) {
                        filesSeen[pathKey] = true;
                        
                        // Check if this file is currently used in AE
                        var matchedAeItem = null;
                        for (var j = 1; j <= app.project.numItems; j++) {
                            var pItem = app.project.item(j);
                            if (pItem instanceof FootageItem && pItem.mainSource && pItem.mainSource.file) {
                                if (pItem.mainSource.file.fsName.toLowerCase() === pathKey) {
                                    matchedAeItem = pItem;
                                    break;
                                }
                            }
                        }
                        
                        filesToMove.push({ file: f, aeItem: matchedAeItem });
                    }
                } else if (f instanceof Folder) {
                    var fName = decodeURI(f.name);
                    var isStandard = false;
                    for (var rootKey in struct) {
                        if (fName === rootKey) {
                            isStandard = true;
                            break;
                        }
                    }
                    if (!isStandard) {
                        foldersToMove.push(f);
                    }
                }
            }
            
            // Also ensure the current active .aep project file is gathered and moved
            if (app.project.file && app.project.file.exists) {
                var aepKey = app.project.file.fsName.toLowerCase();
                if (!filesSeen[aepKey]) {
                    filesSeen[aepKey] = true;
                    filesToMove.push({ file: app.project.file, aeItem: null, isAep: true });
                } else {
                    for (var k = 0; k < filesToMove.length; k++) {
                        if (filesToMove[k].file.fsName.toLowerCase() === aepKey) {
                            filesToMove[k].isAep = true;
                            break;
                        }
                    }
                }
            }
            
            for (var i = 0; i < filesToMove.length; i++) {
                var fObj = filesToMove[i];
                var f = fObj.file;
                var decodedName = decodeURI(f.name);
                var ext = decodedName.toLowerCase().split('.').pop();
                var dest = null;
                
                if (ext === "psd") dest = osFolders["01_ASSET_PSD"];
                else if (ext === "png") dest = osFolders["01_ASSET_PNG"];
                else if (ext === "jpg" || ext === "jpeg") dest = osFolders["01_ASSET_JPEG"];
                else if (ext === "ai" || ext === "eps") dest = osFolders["01_ASSET_AI"];
                else if (ext === "wav" || ext === "mp3" || ext === "aac" || ext === "m4a") dest = osFolders["02_AUDIO_SFX"];
                else if (ext === "mp4" || ext === "mov" || ext === "avi" || ext === "mxf") dest = osFolders["08_VIDEO DATA_RAW"];
                else if (ext === "aep") dest = osFolders["06_PROJECT_AE"];
                else if (ext === "prproj") dest = osFolders["06_PROJECT_PR"];
                else if (ext === "fcpx") dest = osFolders["06_PROJECT_FCPX"];
                else dest = osFolders["01_ASSET"]; // Fallback
                
                if (dest) {
                    var newFileObj = new File(dest.absoluteURI + "/" + decodedName);
                    
                    if (f.fsName !== newFileObj.fsName) {
                        var success = false;
                        if (fObj.isAep) {
                            // Specialized logic for AEP to keep project open and update Recent Files
                            try {
                                app.project.save(newFileObj);
                                try { f.remove(); } catch(e) {}
                                success = true;
                            } catch (e) {}
                        } else {
                            // Try native rename first (using absoluteURI path)
                            success = f.rename(newFileObj.absoluteURI);
                            
                            // Fallback to shell command (highly critical for moving open files on macOS)
                            if (!success) {
                                try {
                                    var isMac = $.os.toLowerCase().indexOf("mac") !== -1;
                                    var escSrc = "'" + f.fsName.replace(/'/g, "'\\''") + "'";
                                    var escDest = "'" + newFileObj.fsName.replace(/'/g, "'\\''") + "'";
                                    var cmd = "";
                                    if (isMac) {
                                        cmd = "mv " + escSrc + " " + escDest;
                                    } else {
                                        cmd = 'cmd.exe /c move "' + f.fsName + '" "' + newFileObj.fsName + '"';
                                    }
                                    system.callSystem(cmd);
                                    if (newFileObj.exists) {
                                        success = true;
                                    }
                                } catch(e) {}
                            }
                            
                            // Last resort fallback: copy & remove
                            if (!success) {
                                if (f.copy(newFileObj)) {
                                    f.remove();
                                    success = true;
                                }
                            }
                        }
                        
                        if (success) {
                            movedCount++;
                            if (fObj.isAep) {
                                movedCurrentAep = true;
                            }
                        }
                    }
                    
                    if (fObj.aeItem) {
                        fObj.aeItem.replace(newFileObj);
                    }
                }
            }
            
            // Move non-standard/unclear folders directly to 01_ASSET/OTHER
            var otherFolderDest = osFolders["01_ASSET_OTHER"];
            for (var i = 0; i < foldersToMove.length; i++) {
                var fold = foldersToMove[i];
                var decodedFoldName = decodeURI(fold.name);
                var newFoldObj = new Folder(otherFolderDest.absoluteURI + "/" + decodedFoldName);
                
                if (fold.fsName !== newFoldObj.fsName) {
                    var foldSuccess = fold.rename(newFoldObj.absoluteURI);
                    if (!foldSuccess) {
                        try {
                            var isMac = $.os.toLowerCase().indexOf("mac") !== -1;
                            var escSrc = "'" + fold.fsName.replace(/'/g, "'\\''") + "'";
                            var escDest = "'" + newFoldObj.fsName.replace(/'/g, "'\\''") + "'";
                            var cmd = "";
                            if (isMac) {
                                cmd = "mv " + escSrc + " " + escDest;
                            } else {
                                cmd = 'cmd.exe /c move "' + fold.fsName + '" "' + otherFolderDest.fsName + '"';
                            }
                            system.callSystem(cmd);
                        } catch(e) {}
                    }
                }
            }
            
            if (movedCurrentAep) {
                // The AEP was saved to the new location natively via app.project.save(newLocation).
                // AE updates Recent Files natively, and we can keep the project open!
                return MotionreisUtils.sendResponse("SUCCESS: Moved " + movedCount + " files. Project has been updated to the new location.");
            } else {
                return MotionreisUtils.sendResponse("SUCCESS: Moved " + movedCount + " files.");
            }
        } catch(e) {
            return MotionreisUtils.sendError(e.message);
        }
    },

    // -----------------------------------------------------------------------------------
    // PROJECT ORGANIZER (OS FILE MANAGER)
    // -----------------------------------------------------------------------------------
    collectFilesToOS: function(argsStr) {
        try {
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            if (!app.project.file) return MotionreisUtils.sendError("Please save your project (File > Save) before collecting assets.");
            
            // Auto-save the project so that no unsaved changes are lost
            if (app && app.project && app.project.file) {
                app.project.save();
            }
            
            app.beginUndoGroup("Collect to OS Folder");
            
            var aepFile = app.project.file;
            var projectDir = aepFile.parent.fsName;
            var projectName = aepFile.name.replace("%20", " ").split(".aep")[0];
            
            var targetDir = new Folder(projectDir + "/" + projectName + "_Collected");
            if (!targetDir.exists) targetDir.create();
            
            var folderNames = {
                footage: "03_FOOTAGE",
                audio: "04_AUDIO",
                vectors: "05_VECTORS",
                images: "06_IMAGES"
            };
            
            var folders = {};
            for (var key in folderNames) {
                folders[key] = new Folder(targetDir.fsName + "/" + folderNames[key]);
                if (!folders[key].exists) folders[key].create();
            }
            
            var collectedCount = 0;
            
            // Loop items to find external files
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                
                if (item instanceof FootageItem && item.mainSource && item.mainSource.file) {
                    var fileObj = item.mainSource.file;
                    if (!fileObj.exists) continue; // Skip missing files
                    
                    var ext = fileObj.name.toLowerCase().split('.').pop();
                    var targetFolderObj = null;
                    
                    if (ext === "mp4" || ext === "mov" || ext === "avi" || ext === "mkv") {
                        targetFolderObj = folders.footage;
                    } else if (ext === "wav" || ext === "mp3" || ext === "aac" || ext === "m4a") {
                        targetFolderObj = folders.audio;
                    } else if (ext === "ai" || ext === "eps" || ext === "svg" || ext === "pdf") {
                        targetFolderObj = folders.vectors;
                    } else if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "psd" || ext === "tiff" || ext === "gif") {
                        targetFolderObj = folders.images;
                    } else {
                        targetFolderObj = folders.footage;
                    }
                    
                    var newFileObj = new File(targetFolderObj.fsName + "/" + fileObj.name);
                    
                    // Copy file if it doesn't already exist there
                    if (!newFileObj.exists || newFileObj.fsName !== fileObj.fsName) {
                        fileObj.copy(newFileObj);
                        collectedCount++;
                    }
                    
                    // Relink inside AE
                    item.replace(newFileObj);
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully collected " + collectedCount + " files to folder " + projectName + "_Collected next to your .aep file. The project is now safe to be moved!");
            
        } catch(e) {
            if(app) app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // -----------------------------------------------------------------------------------
    // RENDER MANAGER
    // -----------------------------------------------------------------------------------
    addToRenderQueue: function(argsStr) {
        try {
            app.beginUndoGroup("Add to Render Queue");
            var comp = MotionreisUtils.getActiveComp();
            
            var rqItem = app.project.renderQueue.items.add(comp);
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully added " + comp.name + " to the Render Queue.");
        } catch(e) {
            if(app) app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    prepCLIRender: function(configPath) {
        try {
            app.beginUndoGroup("Prepare Render Queue V2");
            // Suppress dialogs to prevent headless hangs!
            app.suppressDialogs = true;
            
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            
            // configPath is passed directly as a file path string
            var configFile = new File(configPath);
            if (!configFile.exists) return MotionreisUtils.sendError("Render config file not found: " + configPath);
            
            configFile.open("r");
            var configContent = configFile.read();
            configFile.close();
            var config = MotionreisUtils.safeParse(configContent);
            
            // Force Viewer Focus to get correct active item!
            try { app.activeViewer.setActive(); } catch(e) {}
            
            // Retrieve Target Comp
            var comp = null;
            if (config.compName && config.compName !== "[Auto-Detecting...]" && config.compName !== "Waiting for comp...") {
                for (var i = 1; i <= app.project.numItems; i++) {
                    if (app.project.item(i) instanceof CompItem && app.project.item(i).name === config.compName) {
                        comp = app.project.item(i);
                        break;
                    }
                }
            }
            if (!comp) {
                if (app.project.activeItem && app.project.activeItem instanceof CompItem) {
                    comp = app.project.activeItem;
                } else {
                    return MotionreisUtils.sendError("No active composition found. Please focus a composition first.");
                }
            }
            
            // Path Validation & Save As
            if (!app.project.file) {
                app.project.save(); // Prompts Save As dialog
                if (!app.project.file) {
                    return MotionreisUtils.sendError("Project must be saved to disk before CLI rendering.");
                }
            }
            
            var currentFile = app.project.file;
            
            // Auto-Versioning logic
            if (config.autoVersion) {
                var docName = currentFile.name;
                var parentDir = currentFile.parent.fsName;
                var newName = docName;
                var match = docName.match(/_v(\d+)\.aep$/i);
                
                if (match) {
                    var verNum = parseInt(match[1], 10) + 1;
                    var verStr = verNum < 10 ? "0" + verNum : "" + verNum;
                    newName = docName.replace(/_v\d+\.aep$/i, "_v" + verStr + ".aep");
                } else {
                    newName = docName.replace(/\.aep$/i, "_v01.aep");
                }
                
                var newFileTarget = new File(parentDir + "/" + newName);
                app.project.save(newFileTarget);
                currentFile = app.project.file; // update to new file
            } else if (config.autoSave) {
                app.project.save(currentFile);
            }
            
            // Configure Render Queue
            var rq = app.project.renderQueue;
            while (rq.numItems > 0) { rq.item(1).remove(); }
            
            var rqItem = rq.items.add(comp);
            
            // Render Settings
            if (config.renderSettings && config.renderSettings !== "custom") {
                try { rqItem.applyTemplate(config.renderSettings); } catch(e) { rqItem.applyTemplate("Best Settings"); }
            } else {
                try { rqItem.applyTemplate("Best Settings"); } catch(err) {}
            }
            
            // Output Module
            var om = rqItem.outputModule(1);
            if (config.codec) {
                try {
                    om.applyTemplate(config.codec);
                } catch(e) {
                    try { om.applyTemplate("Lossless"); } catch(err) {}
                }
            } else {
                try { om.applyTemplate("Lossless"); } catch(err) {}
            }
            
            // Time Range
            var startFrame = 0;
            var endFrame = Math.round(comp.duration * comp.frameRate) - 1;
            
            try {
                if (config.timeRange === "fullcomp") {
                    rqItem.timeSpanStart = 0;
                    rqItem.timeSpanDuration = comp.duration;
                    startFrame = 0;
                    endFrame = Math.round(comp.duration * comp.frameRate) - 1;
                } else {
                    rqItem.timeSpanStart = comp.workAreaStart;
                    rqItem.timeSpanDuration = comp.workAreaDuration;
                    startFrame = Math.round(comp.workAreaStart * comp.frameRate);
                    endFrame = Math.round((comp.workAreaStart + comp.workAreaDuration) * comp.frameRate) - 1;
                }
            } catch(err) {}
            
            // Destination Path
            var destDirStr = "";
            if (config.saveNextToAEP) {
                destDirStr = currentFile.parent.fsName;
            } else if (config.outputPath && config.outputPath !== "[Same as Project Folder]") {
                destDirStr = config.outputPath;
            } else {
                destDirStr = currentFile.parent.fsName;
            }
            
            var destFolder = new Folder(destDirStr);
            if (!destFolder.exists) destFolder.create();
            
            var finalName = config.outputName || comp.name;
            var isSequence = false;
            var codecLC = (config.codec || "").toLowerCase();
            if (codecLC.indexOf("sequence") !== -1 || codecLC.indexOf("png") !== -1 || codecLC.indexOf("jpeg") !== -1 || codecLC.indexOf("tiff") !== -1) {
                isSequence = true;
            }
            
            var filePattern = "";
            if (isSequence) {
                // create subfolder for sequence
                var seqFolder = new Folder(destFolder.fsName + "/" + finalName);
                if (!seqFolder.exists) seqFolder.create();
                filePattern = seqFolder.fsName + "/" + finalName + "_[#####]";
                om.file = new File(filePattern);
            } else {
                om.file = new File(destFolder.fsName + "/" + finalName);
            }
            
            // Save project before handing off to aerender so it sees the queue!
            app.project.save(currentFile);
            
            // Clean up: IMMEDIATELY remove the queued item from the ACTIVE project inside After Effects,
            // so the Render Queue panel does not stay dirty, populated, or focused in the user's workspace!
            try {
                rqItem.remove();
            } catch(e) {}
            
            // Refocus the Composition viewer in AE to push the empty Render Queue panel back to the background!
            try {
                comp.openInViewer();
                app.activeViewer.setActive();
            } catch(e) {}
            
            app.endUndoGroup();
            
            return MotionreisUtils.sendResponse({
                projectPath: currentFile.fsName,
                compName: comp.name,
                startFrame: startFrame,
                endFrame: endFrame,
                fps: comp.frameRate,
                finalDestDir: destFolder.fsName,
                finalName: finalName
            });
            
        } catch(e) {
            if(app) app.endUndoGroup();
            return MotionreisUtils.sendError("ExtendScript Prepare Queue Error: " + e.message);
        }
    },
    
    sendToMediaEncoder: function() {
        try {
            app.beginUndoGroup("Send to Media Encoder");
            var comp = MotionreisUtils.getActiveComp();
            
            // Execute the native menu command to send active comp to AME
            var cmdId = app.findMenuCommandId("Add to Adobe Media Encoder Queue...");
            if (cmdId) {
                app.executeCommand(cmdId);
                app.endUndoGroup();
                return MotionreisUtils.sendResponse("Successfully sent " + comp.name + " to Media Encoder.");
            } else {
                app.endUndoGroup();
                return MotionreisUtils.sendError("Failed to trigger Adobe Media Encoder.");
            }
        } catch(e) {
            if(app) app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },

    // -----------------------------------------------------------------------------------
    // EXPRESSION IDE
    // -----------------------------------------------------------------------------------
    applyIDEExpression: function(argsStr) {
        try {
            app.beginUndoGroup("Apply IDE Expression");
            var args = MotionreisUtils.safeParse(argsStr);
            var comp = MotionreisUtils.getActiveComp();
            
            if (!args.expression || args.expression === "") {
                return MotionreisUtils.sendError("Expression is empty.");
            }
            
            var selectedProps = comp.selectedProperties;
            if (selectedProps.length === 0) {
                return MotionreisUtils.sendError("Please select a Property (e.g. Position/Scale) in the timeline first.");
            }
            
            var appliedCount = 0;
            for (var i = 0; i < selectedProps.length; i++) {
                if (selectedProps[i].canSetExpression) {
                    var cur = selectedProps[i].expression;
                    selectedProps[i].expression = (cur && cur !== "") ? cur + (cur.charAt(cur.length-1) === ';' ? '\n' : ';\n') + args.expression : args.expression;
                    appliedCount++;
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Successfully applied expression to " + appliedCount + " properties.");
        } catch(e) {
            if(app) app.endUndoGroup();
            return MotionreisUtils.sendError(e.message);
        }
    },
    // -----------------------------------------------------------------------------------
    // DEEP DUPLICATOR
    // -----------------------------------------------------------------------------------
    deepDuplicate: function(argsStr) {
        try {
            app.beginUndoGroup("Deep Duplicator");
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            
            var args = MotionreisUtils.safeParse(argsStr);
            var activeItem = app.project.activeItem;
            if (!activeItem || !(activeItem instanceof CompItem)) {
                return MotionreisUtils.sendError("Select or open a Composition to duplicate.");
            }
            
            function escapeRegExp(string) {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }

            function applyNamingRules(oldName) {
                var newName = oldName;
                
                if (args.replaceCb && args.searchText !== "") {
                    var regex = new RegExp(escapeRegExp(args.searchText), 'g');
                    newName = newName.replace(regex, args.replaceText);
                }
                
                if (args.incCb) {
                    var numRegex = /\d+/g;
                    var match;
                    var matches = [];
                    while ((match = numRegex.exec(newName)) !== null) {
                        matches.push({val: match[0], index: match.index});
                    }
                    if (matches.length > 0) {
                        var target = (args.incType === "first") ? matches[0] : matches[matches.length - 1];
                        var numStr = target.val;
                        var numLen = numStr.length;
                        var newNum = parseInt(numStr, 10) + 1;
                        var newNumStr = newNum.toString();
                        while (newNumStr.length < numLen) newNumStr = "0" + newNumStr;
                        newName = newName.substring(0, target.index) + newNumStr + newName.substring(target.index + numLen);
                    }
                }
                
                if (args.fixCb && args.fixText !== "") {
                    if (args.fixType === "prefix") {
                        newName = args.fixText + newName;
                    } else {
                        newName = newName + args.fixText;
                    }
                }
                
                return newName;
            }

            function updateExpressions(propGroup, nameMap) {
                for (var i = 1; i <= propGroup.numProperties; i++) {
                    var prop = propGroup.property(i);
                    if (prop.propertyType === PropertyType.PROPERTY) {
                        if (prop.canSetExpression && prop.expression !== "") {
                            var expr = prop.expression;
                            var changed = false;
                            for (var oldName in nameMap) {
                                if (nameMap.hasOwnProperty(oldName)) {
                                    var newName = nameMap[oldName];
                                    var compRegex = new RegExp('comp\\([\'"]' + escapeRegExp(oldName) + '[\'"]\\)', 'g');
                                    if (compRegex.test(expr)) {
                                        expr = expr.replace(compRegex, 'comp("' + newName + '")');
                                        changed = true;
                                    }
                                }
                            }
                            if (changed) prop.expression = expr;
                        }
                    } else if (prop.propertyType === PropertyType.NAMED_GROUP || prop.propertyType === PropertyType.INDEXED_GROUP) {
                        updateExpressions(prop, nameMap);
                    }
                }
            }

            var duplicatedRoots = [];
            var targetFolder = null;
            if (args.folderCb && args.folderName !== "") {
                targetFolder = app.project.items.addFolder(args.folderName);
            }

            for (var c = 0; c < args.copies; c++) {
                var dupMap = {};
                var nameMap = {};
                
                function duplicateTree(item, depth) {
                    if (dupMap[item.id]) return dupMap[item.id];
                    if (args.depthCb && depth > args.depthVal) return item;
                    
                    if (args.excludeCb && args.excludeText !== "") {
                        if (args.excludeType === "prefix" && item.name.indexOf(args.excludeText) === 0) return item;
                        if (args.excludeType === "suffix" && item.name.indexOf(args.excludeText, item.name.length - args.excludeText.length) !== -1) return item;
                    }

                    if (item instanceof FootageItem) {
                        if (item.mainSource instanceof SolidSource && !args.solidsCb) return item;
                        if (!(item.mainSource instanceof SolidSource) && !args.footageCb) return item;
                    }

                    var newItem = item.duplicate();
                    newItem.name = applyNamingRules(item.name);
                    
                    if (args.colorCb) newItem.label = args.colorVal;
                    if (targetFolder) newItem.parentFolder = targetFolder;

                    dupMap[item.id] = newItem;
                    nameMap[item.name] = newItem.name;

                    if (newItem instanceof CompItem) {
                        for (var i = 1; i <= newItem.numLayers; i++) {
                            var layer = newItem.layers(i);
                            if (layer.source) {
                                var newSource = duplicateTree(layer.source, depth + 1);
                                if (newSource.id !== layer.source.id) {
                                    layer.replaceSource(newSource, false);
                                }
                            }
                        }
                    }
                    return newItem;
                }

                var newRoot = duplicateTree(activeItem, 0);
                
                if (args.exprCb) {
                    for (var id in dupMap) {
                        if (dupMap.hasOwnProperty(id) && dupMap[id] instanceof CompItem) {
                            var compToUpdate = dupMap[id];
                            for (var i = 1; i <= compToUpdate.numLayers; i++) {
                                updateExpressions(compToUpdate.layers(i), nameMap);
                            }
                        }
                    }
                }
                
                duplicatedRoots.push(newRoot);
            }
            
            if (args.selectCb) {
                for (var i = 1; i <= app.project.numItems; i++) app.project.items[i].selected = false;
                for (var i = 0; i < duplicatedRoots.length; i++) duplicatedRoots[i].selected = true;
            }

            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Deep Duplicate successful: " + duplicatedRoots[0].name);
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    collectDependencies: function() {
        try {
            app.beginUndoGroup("Collect Dependencies");
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            
            var activeItem = app.project.activeItem;
            if (!activeItem || !(activeItem instanceof CompItem)) {
                return MotionreisUtils.sendError("Select a Composition to collect dependencies for.");
            }

            var deps = {};
            function getDeps(comp) {
                for (var i = 1; i <= comp.numLayers; i++) {
                    var layer = comp.layers(i);
                    if (layer.source) {
                        if (!deps[layer.source.id]) {
                            deps[layer.source.id] = layer.source;
                            if (layer.source instanceof CompItem) {
                                getDeps(layer.source);
                            }
                        }
                    }
                }
            }
            
            getDeps(activeItem);
            
            var targetFolder = app.project.items.addFolder(activeItem.name + " Dependencies");
            var count = 0;
            for (var id in deps) {
                if (deps.hasOwnProperty(id)) {
                    if (deps[id] instanceof FootageItem && !(deps[id].mainSource instanceof SolidSource)) {
                        deps[id].parentFolder = targetFolder;
                        count++;
                    }
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Collected " + count + " items into folder: " + targetFolder.name);
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },
    
    smartRelink: function(folderPath) {
        try {
            app.beginUndoGroup("Smart Relinker");
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            
            var missingItems = [];
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.items[i];
                if (item instanceof FootageItem && item.footageMissing) {
                    missingItems.push(item);
                }
            }
            
            if (missingItems.length === 0) {
                app.endUndoGroup();
                return MotionreisUtils.sendResponse(JSON.stringify({ count: 0, items: [] }));
            }
            
            var fileMap = {};
            function scanFolder(folder, depth) {
                if (depth > 12) return;
                var files = folder.getFiles();
                for (var i = 0; i < files.length; i++) {
                    var f = files[i];
                    if (f instanceof Folder) {
                        scanFolder(f, depth + 1);
                    } else if (f instanceof File) {
                        var name = decodeURI(f.name).toLowerCase();
                        if (!fileMap[name]) {
                            fileMap[name] = f;
                        }
                    }
                }
            }
            
            var rootFolder = new Folder(folderPath);
            if (!rootFolder.exists) {
                app.endUndoGroup();
                return MotionreisUtils.sendError("Selected folder does not exist.");
            }
            scanFolder(rootFolder, 0);
            
            var relinked = [];
            var count = 0;
            for (var i = 0; i < missingItems.length; i++) {
                var item = missingItems[i];
                var oldName = decodeURI(item.name).toLowerCase();
                if (item.mainSource && item.mainSource.file) {
                    oldName = decodeURI(item.mainSource.file.name).toLowerCase();
                }
                
                if (fileMap[oldName]) {
                    try {
                        item.replace(fileMap[oldName]);
                        relinked.push({ id: item.id, path: fileMap[oldName].fsName, name: item.name });
                        count++;
                    } catch(err) {}
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse(JSON.stringify({ count: count, items: relinked }));
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },
    
    prSmartRelink: function(folderPath) {
        try {
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            
            var missingItems = [];
            
            function scanProjectForMissing(bin) {
                var children = bin.children;
                for (var i = 0; i < children.numItems; i++) {
                    var child = children[i];
                    if (child.type === ProjectItemType.BIN) {
                        scanProjectForMissing(child);
                    } else if (child.type === ProjectItemType.CLIP && !child.isSequence()) {
                        var mediaPath = child.getMediaPath();
                        if (mediaPath) {
                            var f = new File(mediaPath);
                            if (!f.exists) {
                                missingItems.push(child);
                            }
                        }
                    }
                }
            }
            scanProjectForMissing(app.project.rootItem);
            
            if (missingItems.length === 0) {
                return MotionreisUtils.sendResponse(JSON.stringify({ count: 0, items: [] }));
            }
            
            var fileMap = {};
            function scanFolder(folder, depth) {
                if (depth > 12) return;
                var files = folder.getFiles();
                for (var i = 0; i < files.length; i++) {
                    var f = files[i];
                    if (f instanceof Folder) {
                        scanFolder(f, depth + 1);
                    } else if (f instanceof File) {
                        var name = decodeURI(f.name).toLowerCase();
                        if (!fileMap[name]) {
                            fileMap[name] = f;
                        }
                    }
                }
            }
            
            var rootFolder = new Folder(folderPath);
            if (!rootFolder.exists) {
                return MotionreisUtils.sendError("Selected folder does not exist.");
            }
            scanFolder(rootFolder, 0);
            
            var relinked = [];
            var count = 0;
            for (var i = 0; i < missingItems.length; i++) {
                var item = missingItems[i];
                var oldName = item.name.toLowerCase();
                var pathVal = item.getMediaPath();
                if (pathVal) {
                    var parts = pathVal.split(/[\/\\]/);
                    oldName = parts[parts.length-1].toLowerCase();
                }
                
                if (fileMap[oldName]) {
                    try {
                        item.changeMediaPath(fileMap[oldName].fsName);
                        count++;
                        relinked.push(decodeURI(fileMap[oldName].name));
                    } catch(e) {}
                }
            }
            
            return MotionreisUtils.sendResponse(JSON.stringify({ count: count, items: relinked }));
        } catch(e) { return MotionreisUtils.sendError(e.message); }
    },
    
    relinkToNewPaths: function(argsStr) {
        try {
            app.beginUndoGroup("Move & Relink");
            var mappings = MotionreisUtils.safeParse(argsStr);
            var count = 0;
            
            for (var m = 0; m < mappings.length; m++) {
                var mapping = mappings[m];
                var targetItem = null;
                for (var i = 1; i <= app.project.numItems; i++) {
                    if (app.project.items[i].id === mapping.id) {
                        targetItem = app.project.items[i];
                        break;
                    }
                }
                if (targetItem && targetItem instanceof FootageItem) {
                    try {
                        targetItem.replace(new File(mapping.newPath));
                        count++;
                    } catch(err) {}
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse(count + " items successfully relinked to organized folders.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // ---- TIMELINE MANAGEMENT ----
    autoColorCoder: function() {
        try {
            app.beginUndoGroup("Prism Auto Color");
            var comp = MotionreisUtils.getActiveComp();
            
            // Rules
            var rules = [
                { match: /bg|background/i, label: 8 }, // Blue
                { match: /null|ctrl|control/i, label: 1 }, // Red
                { match: /text|txt/i, label: 11 }, // Orange
                { match: /matte|mask/i, label: 10 }, // Purple
                { match: /cam|camera/i, label: 4 }, // Pink
                { match: /audio|wav|mp3/i, label: 6 }, // Cyan
                { match: /shape/i, label: 2 } // Yellow
            ];
            
            var count = 0;
            for (var i = 1; i <= comp.numLayers; i++) {
                var l = comp.layers(i);
                for (var r = 0; r < rules.length; r++) {
                    if (rules[r].match.test(l.name)) {
                        l.label = rules[r].label;
                        count++;
                        break;
                    }
                }
            }
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Prism successfully color-coded " + count + " layers automatically.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    cleanProject: function() {
        try {
            app.beginUndoGroup("Declutter Project");
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            
            // Native AE consolidate footage
            app.project.consolidateFootage();
            app.project.removeUnusedFootage();
            
            // Remove empty folders
            var removedFolders = 0;
            // Iterate backwards when deleting
            for (var i = app.project.numItems; i >= 1; i--) {
                var item = app.project.item(i);
                if (item instanceof FolderItem && item.numItems === 0) {
                    item.remove();
                    removedFolders++;
                }
            }
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Declutter successfully removed unused footage & " + removedFolders + " empty folders.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    groupSelectedLayers: function() {
        try {
            app.beginUndoGroup("Workflower Group");
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            
            if (layers.length === 0) return MotionreisUtils.sendError("Select layers to group.");
            
            // Find top layers index to insert Null above it
            var topIndex = comp.numLayers + 1;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].index < topIndex) topIndex = layers[i].index;
            }
            
            // Create Null
            var groupNull = comp.layers.addNull();
            groupNull.name = "Group Controller";
            groupNull.moveBefore(comp.layers(topIndex));
            groupNull.label = 13; // Sand
            
            // Parent selected layers to Null and shy them
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].parent == null) {
                    // Spatial Hierarchy Lock:
                    // Assigning layers.parent natively in AE automatically compensates local transform values 
                    // (and keyframes) to lock the visual world-space coordinates, preventing any visual jumping.
                    layers[i].parent = groupNull;
                }
                layers[i].label = groupNull.label;
                layers[i].shy = true;
            }
            
            // Enable composition shy switch
            comp.hideShyLayers = true;
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Workflower successfully grouped " + layers.length + " layers into one folder.");
        } catch(e) { app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    // ---- VFX DATA BRIDGE ----
    // Export selected layers transform data as .chan (Nuke/Blender/Maya compatible)
    exportVFXData: function(argsStr) {
        try {
            var args = argsStr ? MotionreisUtils.safeParse(argsStr) : {};
            var format = args.format || 'chan';
            var comp = MotionreisUtils.getActiveComp();
            var layers = MotionreisUtils.getSelectedLayers(comp);
            if (layers.length === 0) return MotionreisUtils.sendError("Select layers to export transform data.");

            var layers = layers[0];
            var fps = comp.framesRate;
            var totalFrames = Math.round(comp.duration * fps);
            var lines = [];

            if (format === 'chan') {
                // .chan format: frames tx ty tz rx ry rz fov
                for (var f = 0; f < totalFrames; f++) {
                    var t = f / fps;
                    var pos = layers.position.valueAtTime(t, false);
                    var rot = layers.rotation.valueAtTime(t, false);
                    var px = pos.length >= 1 ? pos[0] : pos;
                    var py = pos.length >= 2 ? pos[1] : 0;
                    var pz = pos.length >= 3 ? pos[2] : 0;
                    lines.push(f + '\t' + px.toFixed(4) + '\t' + py.toFixed(4) + '\t' + pz.toFixed(4) + '\t0.0000\t' + rot.toFixed(4) + '\t0.0000\t50.0000');
                }
            } else {
                // Python / JSON array format
                lines.push('{"frames": [');
                for (var f = 0; f < totalFrames; f++) {
                    var t = f / fps;
                    var pos = layers.position.valueAtTime(t, false);
                    var rot = layers.rotation.valueAtTime(t, false);
                    var px = pos.length >= 1 ? pos[0] : pos;
                    var py = pos.length >= 2 ? pos[1] : 0;
                    var pz = pos.length >= 3 ? pos[2] : 0;
                    var comma = (f < totalFrames - 1) ? ',' : '';
                    lines.push('  {"frames":' + f + ',"x":' + px.toFixed(4) + ',"y":' + py.toFixed(4) + ',"z":' + pz.toFixed(4) + ',"rz":' + rot.toFixed(4) + '}' + comma);
                }
                lines.push(']}');
            }

            // Write to Desktop
            var ext = (format === 'chan') ? '.chan' : '.json';
            var outFile = new File(Folder.desktop.fsName + '/' + layers.name.replace(/[^a-z0-9_]/gi, '_') + '_transform' + ext);
            outFile.open('w');
            outFile.write(lines.join('\n'));
            outFile.close();

            return MotionreisUtils.sendResponse('Export successful! File saved to Desktop: ' + outFile.name);
        } catch(e) { return MotionreisUtils.sendError(e.message); }
    },

    // ---- CUSTOM SCRIPTS (MACRO) ----
    runMacro: function(argsStr) {
        try {
            var args = argsStr ? MotionreisUtils.safeParse(argsStr) : {};
            var id = args.id || 1;

            // -- SLOT 1: Rename selected layers sequentially --
            if (id === 1) {
                app.beginUndoGroup('Macro: Rename Sequential');
                var comp = MotionreisUtils.getActiveComp();
                var layers = MotionreisUtils.getSelectedLayers(comp);
                if (layers.length === 0) { app.endUndoGroup(); return MotionreisUtils.sendError('S1: Select layers first.'); }
                for (var i = 0; i < layers.length; i++) {
                    layers[i].name = layers[i].name.replace(/\s*\d+$/, '') + ' ' + (i + 1);
                }
                app.endUndoGroup();
                return MotionreisUtils.sendResponse('S1: Successfully renamed ' + layers.length + ' layers sequentially.');
            }

            // -- SLOT 2: Lock all guide layers --
            if (id === 2) {
                app.beginUndoGroup('Macro: Lock Guides');
                var comp = MotionreisUtils.getActiveComp();
                var count = 0;
                for (var i = 1; i <= comp.numLayers; i++) {
                    if (comp.layers(i).guideLayer) { comp.layers(i).locked = true; count++; }
                }
                app.endUndoGroup();
                return MotionreisUtils.sendResponse('S2: Successfully locked ' + count + ' guide layers.');
            }

            // -- SLOT 3: Solo selected layers, unsolo all others --
            if (id === 3) {
                app.beginUndoGroup('Macro: Solo Selected');
                var comp = MotionreisUtils.getActiveComp();
                var layers = MotionreisUtils.getSelectedLayers(comp);
                if (layers.length === 0) { app.endUndoGroup(); return MotionreisUtils.sendError('S3: Select layers first.'); }
                for (var i = 1; i <= comp.numLayers; i++) { comp.layers(i).solo = false; }
                for (var i = 0; i < layers.length; i++) { layers[i].solo = true; }
                app.endUndoGroup();
                return MotionreisUtils.sendResponse('S3: Successfully soloed ' + layers.length + ' layers.');
            }

            // -- SLOT 4: Snap all selected layers in-point to playhead --
            if (id === 4) {
                app.beginUndoGroup('Macro: Snap to Playhead');
                var comp = MotionreisUtils.getActiveComp();
                var layers = MotionreisUtils.getSelectedLayers(comp);
                if (layers.length === 0) { app.endUndoGroup(); return MotionreisUtils.sendError('S4: Select layers first.'); }
                var ph = comp.time;
                for (var i = 0; i < layers.length; i++) {
                    var dur = layers[i].outPoint - layers[i].inPoint;
                    layers[i].inPoint = ph;
                    layers[i].outPoint = ph + dur;
                }
                app.endUndoGroup();
                return MotionreisUtils.sendResponse('S4: Successfully snapped ' + layers.length + ' layers to playhead.');
            }

            return MotionreisUtils.sendError('Slot Macro ' + id + ' not found.');
        } catch(e) { if(app) app.endUndoGroup(); return MotionreisUtils.sendError(e.message); }
    },

    scanEffects: function(argsStr) {
        try {
            var args = MotionreisUtils.safeParse(argsStr);
            var query = (args.query || "").toLowerCase();
            if (!query) return MotionreisUtils.sendResponse("[]");
            
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            
            var results = [];
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem) {
                    for (var j = 1; j <= item.numLayers; j++) {
                        var layer = item.layer(j);
                        var effectGroup = layer.property("ADBE Effect Parade");
                        if (effectGroup) {
                            for (var k = 1; k <= effectGroup.numProperties; k++) {
                                var effect = effectGroup.property(k);
                                var efName = effect.name.toLowerCase();
                                var matchName = effect.matchName.toLowerCase();
                                if (efName.indexOf(query) !== -1 || matchName.indexOf(query) !== -1) {
                                    results.push({
                                        compId: item.id,
                                        compName: item.name,
                                        layerIndex: j,
                                        layerName: layer.name,
                                        effectName: effect.name
                                    });
                                }
                            }
                        }
                    }
                }
            }
            return MotionreisUtils.sendResponse(JSON.stringify(results));
        } catch(e) { return MotionreisUtils.sendError("Scanner Error: " + e.message); }
    },

    selectLayerInTimeline: function(argsStr) {
        try {
            var args = MotionreisUtils.safeParse(argsStr);
            var compId = parseInt(args.compId, 10);
            var layerIndex = parseInt(args.layerIndex, 10);
            
            if (!app.project) return MotionreisUtils.sendError("No project open.");
            
            var targetItem = app.project.itemByID(compId);
            if (targetItem && targetItem instanceof CompItem) {
                targetItem.openInViewer();
                
                // Deselect all layers first
                for (var i = 1; i <= targetItem.numLayers; i++) {
                    targetItem.layer(i).selected = false;
                }
                
                // Select the target layer
                if (layerIndex > 0 && layerIndex <= targetItem.numLayers) {
                    targetItem.layer(layerIndex).selected = true;
                }
                
                return MotionreisUtils.sendResponse("Success");
            } else {
                return MotionreisUtils.sendError("Comp not found.");
            }
        } catch(e) { return MotionreisUtils.sendError(e.message); }
    },

    // Router function called from UI
    run: function(argsStr) {
        var args = MotionreisUtils.safeParse(argsStr);
        
        if (args.action === 'organizeProject') return this.organizeProject(argsStr);
        if (args.action === 'prOrganizeProject') return this.prOrganizeProject(argsStr);
        if (args.action === 'osOrganizeProject') return this.osOrganizeProject(argsStr);
        if (args.action === 'purgeCache') return this.purgeCache(argsStr);
        if (args.action === 'collectFilesToOS') return this.collectFilesToOS(argsStr);
        if (args.action === 'addToRenderQueue') return this.addToRenderQueue();
        if (args.action === 'sendToMediaEncoder') return this.sendToMediaEncoder();
        if (args.action === 'applyIDEExpression') return this.applyIDEExpression(argsStr);
        if (args.action === 'deepDuplicate') return this.deepDuplicate(argsStr);
        
        if (args.action === 'autoLabelLayers') return this.autoColorCoder();
        if (args.action === 'cleanProject') return this.cleanProject();
        if (args.action === 'groupSelectedLayers') return this.groupSelectedLayers();
        if (args.action === 'exportVFXData') return this.exportVFXData(argsStr);
        if (args.action === 'runMacro') return this.runMacro(argsStr);
        if (args.action === 'scanEffects') return this.scanEffects(argsStr);
        if (args.action === 'selectLayerInTimeline') return this.selectLayerInTimeline(argsStr);
        
        return MotionreisUtils.sendError("Pipeline function not yet implemented.");
    }
};

// --- GLOBAL FUNCTIONS FOR AI VIRAL CLIPPER ---

function getTimelineSourceFile() {
    try {
        var seq = app.project.activeSequence;
        if (!seq) return "Error: Tidak ada sequence aktif";
        if (seq.videoTracks.numTracks === 0) return "Error: Tidak ada track video";
        
        var clip = null;
        for (var i = 0; i < seq.videoTracks[0].clips.numItems; i++) {
            clip = seq.videoTracks[0].clips[i];
            break; // Ambil klip pertama
        }
        
        if (!clip) return "Error: Tidak ada klip di V1";
        
        var projItem = clip.projectItem;
        if (!projItem) return "Error: Project Item tidak ditemukan";
        
        var path = projItem.getMediaPath();
        return path ? path : "Error: Media path kosong";
    } catch(e) {
        return "Error: " + e.message;
    }
}

function createVerticalHighlight(startSec, endSec, srtPath) {
    try {
        var seq = app.project.activeSequence;
        if (!seq) return "Error: Tidak ada sequence aktif";
        
        var seqName = seq.name;
        var clone = seq.clone(); 
        if (!clone) return "Error: Gagal duplikasi sequence";
        
        clone.name = seqName + "_VIRAL_CLIP";
        app.project.activeSequence = clone; // Buka sequence hasil clone
        
        // Hapus klip yang berada di luar range startSec - endSec
        // Kita iterasi mundur supaya indeks tidak bergeser
        for (var i = 0; i < clone.videoTracks.numTracks; i++) {
            var track = clone.videoTracks[i];
            var toRemove = [];
            for (var j = 0; j < track.clips.numItems; j++) {
                var c = track.clips[j];
                var cStart = parseFloat(c.start.seconds);
                var cEnd = parseFloat(c.end.seconds);
                
                // Jika klip berada DILUAR rentang (berakhir sebelum start, atau mulai setelah end)
                if (cEnd <= startSec || cStart >= endSec) {
                    toRemove.push(c);
                } else {
                    // Klip berpotongan dengan area viral, kita biarkan atau potong sedikit (sulit via DOM standar).
                    // Asumsi: klip utuh dibiarkan, nanti dirapihkan
                }
            }
            
            for (var k = toRemove.length - 1; k >= 0; k--) {
                toRemove[k].remove(0, 1); // argumen: remove(shift, ripple). 0,1 berarti ripple delete
            }
        }
        
        // Lakukan hal yang sama untuk audio
        for (var a = 0; a < clone.audioTracks.numTracks; a++) {
            var aTrack = clone.audioTracks[a];
            var aToRemove = [];
            for (var b = 0; b < aTrack.clips.numItems; b++) {
                var ac = aTrack.clips[b];
                var acStart = parseFloat(ac.start.seconds);
                var acEnd = parseFloat(ac.end.seconds);
                if (acEnd <= startSec || acStart >= endSec) {
                    aToRemove.push(ac);
                }
            }
            for (var c2 = aToRemove.length - 1; c2 >= 0; c2--) {
                aToRemove[c2].remove(0, 1);
            }
        }
        
        try {
            // Auto reframe ke TikTok/Reels (Vertical 9:16)
            clone.autoReframeSequence("9x16", "default");
        } catch(e) {
            // Jika gagal (versi lama), ubah manual
            clone.frameSizeHorizontal = 1080;
            clone.frameSizeVertical = 1920;
        }
        
        // Import SRT jika ada
        if (srtPath) {
            try {
                // Import file srt ke root project bin
                app.project.importFiles([srtPath], false, app.project.rootItem, false);
            } catch(e) {
                // Abaikan error import srt
            }
        }
        
        return "Success";
    } catch(e) {
        return "Error: " + e.message;
    }
}
