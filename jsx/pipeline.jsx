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
                "06_PROJECT": ["AE", "FCPX", "PR"],
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
            
            var memo = {};
            function getCompDepth(comp) {
                if (memo[comp.id]) return memo[comp.id];
                if (comp.usedIn.length === 0) {
                    memo[comp.id] = 0;
                    return 0;
                }
                var maxParentDepth = 0;
                for (var j = 0; j < comp.usedIn.length; j++) {
                    var parentComp = comp.usedIn[j];
                    var parentDepth = getCompDepth(parentComp);
                    if (parentDepth > maxParentDepth) {
                        maxParentDepth = parentDepth;
                    }
                }
                var depth = 1 + maxParentDepth;
                memo[comp.id] = depth;
                return depth;
            }

            function getOrCreateFolderForDepth(depth, parentFolder) {
                if (depth <= 1) {
                    return parentFolder;
                }
                var currentParent = parentFolder;
                for (var d = 2; d <= depth; d++) {
                    var folderName = "Precomp Inner";
                    for (var k = 3; k <= d; k++) {
                        folderName += " Inner";
                    }
                    currentParent = getOrCreateFolder(folderName, currentParent);
                }
                return currentParent;
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
            
            var itemsToMove = [];
            for (var i = 1; i <= proj.numItems; i++) {
                itemsToMove.push(proj.item(i));
            }
            
            for (var i = 0; i < itemsToMove.length; i++) {
                var item = itemsToMove[i];
                var dest = null;
                
                if (item instanceof CompItem) {
                    if (item.usedIn.length > 0) {
                        var depth = getCompDepth(item);
                        dest = getOrCreateFolderForDepth(depth, folders["06_COMP_PRECOMP"]);
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
                        else if (ext === "aep") dest = folders["06_PROJECT_AE"];
                        else if (ext === "prproj") dest = folders["06_PROJECT_PR"];
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
    
    osOrganizeProject: function(argsStr) {
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
                        // Try native rename first (using absoluteURI path)
                        var success = f.rename(newFileObj.absoluteURI);
                        
                        // Fallback to shell command (highly critical for moving open .aep files on macOS)
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
                // If AEP was moved, force an un-ignorable AE alert, then forcefully close the project to prevent saving duplicates.
                alert("🚨 CRITICAL ACTION 🚨\n\nYour project file (.aep) has been moved to the new Master Folder.\n\nTo prevent saving duplicates, this project will now close automatically. Please re-open the project from your new Master Folder.", "Motionreis Organizer", false);
                app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
                return MotionreisUtils.sendResponse("Organizer finished. Project was closed safely.");
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

    prepareRenderQueue: function(argsStr) {
        try {
            app.beginUndoGroup("Prepare Render Queue V2");
            
            if (!app.project) {
                return MotionreisUtils.sendError("No project open.");
            }
            
            var args = JSON.parse(argsStr);
            var configPath = args.configPath;
            
            // Read config file
            var configFile = new File(configPath);
            if (!configFile.exists) {
                return MotionreisUtils.sendError("Render config file not found: " + configPath);
            }
            
            configFile.open("r");
            var configContent = configFile.read();
            configFile.close();
            
            var config = JSON.parse(configContent);
            
            // Retrieve Target Comp
            var comp = null;
            if (config.compName && config.compName !== "[Auto-Detecting...]" && config.compName !== "Waiting for comp...") {
                // Find comp by name
                for (var i = 1; i <= app.project.numItems; i++) {
                    if (app.project.item(i) instanceof CompItem && app.project.item(i).name === config.compName) {
                        comp = app.project.item(i);
                        break;
                    }
                }
            }
            
            // Fallback to active comp
            if (!comp) {
                comp = MotionreisUtils.getActiveComp();
            }
            
            if (!comp) {
                return MotionreisUtils.sendError("No active or matching composition found to render.");
            }
            
            // Auto-Save Project if requested
            if (config.autoSave && app.project.file) {
                app.project.save();
            } else if (config.autoSave && !app.project.file) {
                return MotionreisUtils.sendError("Please save your project (.aep) at least once before auto-saving and rendering.");
            }
            
            // Clear existing Render Queue items
            var rq = app.project.renderQueue;
            while (rq.numItems > 0) {
                rq.item(1).remove();
            }
            
            // Add Comp to Render Queue
            var rqItem = rq.items.add(comp);
            
            // Configure Render Settings Template
            if (config.renderSettings && config.renderSettings !== "custom") {
                try {
                    rqItem.applyTemplate(config.renderSettings);
                } catch(e) {
                    try { rqItem.applyTemplate("Best Settings"); } catch(err) {}
                }
            } else {
                try { rqItem.applyTemplate("Best Settings"); } catch(err) {}
            }
            
            // Force Render Settings Time Range
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
            
            // Configure Output Module (Forced to PNG Sequence for multi-threaded chunk rendering!)
            var om = rqItem.outputModule(1);
            var success = false;
            var seqTemplates = ["PNG Sequence", "PNG Sequence with Alpha", "PNG", "Photoshop", "TIFF Sequence", "JPEG Sequence"];
            for (var t = 0; t < seqTemplates.length; t++) {
                try {
                    om.applyTemplate(seqTemplates[t]);
                    success = true;
                    break;
                } catch(e) {}
            }
            if (!success) {
                try { om.applyTemplate("Lossless"); } catch(err) {}
            }
            
            // Determine Destination Path
            var projectFile = app.project.file;
            var destDirStr = "";
            
            if (config.saveNextToAEP && projectFile) {
                destDirStr = projectFile.parent.fsName;
            } else if (config.outputPath && config.outputPath !== "[Same as Project Folder]") {
                destDirStr = config.outputPath;
            } else if (projectFile) {
                destDirStr = projectFile.parent.fsName;
            } else {
                return MotionreisUtils.sendError("No output path specified and project has not been saved yet.");
            }
            
            var finalName = config.outputName || comp.name;
            
            // Ensure destination directory exists
            var destFolder = new Folder(destDirStr);
            if (!destFolder.exists) {
                destFolder.create();
            }
            
            // Create a temp chunks directory next to output path
            var chunksDirName = finalName + "_chunks";
            var chunksFolder = new Folder(destFolder.fsName + "/" + chunksDirName);
            if (!chunksFolder.exists) {
                chunksFolder.create();
            }
            
            // Apply naming convention for output file (PNG sequence pattern: frame_[#####].png)
            var filePattern = chunksFolder.fsName + "/frame_[#####].png";
            om.file = new File(filePattern);
            
            // Save the project one last time to save the render queue item (so aerender CLI will see it in the saved AEP on disk!)
            app.project.save();
            
            // Clean up: IMMEDIATELY remove the queued item from the ACTIVE project inside After Effects,
            // so the Render Queue panel does not stay dirty, populated, or focused in the user's workspace!
            try {
                rqItem.remove();
            } catch(e) {}
            
            // Refocus the Composition viewer in AE to push the empty Render Queue panel back to the background!
            try {
                comp.openInViewer();
            } catch(e) {}
            
            app.endUndoGroup();
            
            return MotionreisUtils.sendResponse({
                projectPath: projectFile.fsName,
                compName: comp.name,
                startFrame: startFrame,
                endFrame: endFrame,
                fps: comp.frameRate,
                chunksDir: chunksFolder.fsName,
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
            var args = JSON.parse(argsStr);
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
            
            var args = JSON.parse(argsStr);
            var activeItem = app.project.activeItem;
            if (!activeItem || !(activeItem instanceof CompItem)) {
                return MotionreisUtils.sendError("Select or open a Composition to duplicate.");
            }
            
            // Simplified deep duplicate logic: just duplicate the main comp
            // A full deep duplicator requires recursive function which we built in previous session.
            function updateExpressions(layers, oldName, newName) {
                for (var i = 1; i <= layers.numProperties; i++) {
                    var prop = layers.property(i);
                    if (prop.canSetExpression && prop.expression !== "") {
                        prop.expression = prop.expression.replace(new RegExp(oldName, 'g'), newName);
                    }
                    if (prop.propertyType === PropertyType.PROPERTY || prop.propertyType === PropertyType.NAMED_GROUP) {
                        if (prop.numProperties) updateExpressions(prop, oldName, newName);
                    }
                }
            }

            function duplicateComp(comp, depth) {
                if (depth > 20) throw new Error("Recursive limit reached (20). Terlalu banyak pre-comp bersarang, hati-hati Stack Overflow!");
                
                var newComp = comp.duplicate();
                newComp.name = comp.name + " " + args.suffix;
                
                for (var i = 1; i <= newComp.numLayers; i++) {
                    var layers = newComp.layers(i);
                    if (layers.source && layers.source instanceof CompItem) {
                        var newSubComp = duplicateComp(layers.source, depth + 1);
                        layers.replaceSource(newSubComp, false);
                    }
                }
                
                for (var i = 1; i <= newComp.numLayers; i++) {
                    updateExpressions(newComp.layers(i), comp.name, newComp.name);
                }
                
                return newComp;
            }
            
            var result = duplicateComp(activeItem, 0);
            
            app.endUndoGroup();
            return MotionreisUtils.sendResponse("Deep Duplicate successful: " + result.name);
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
            var args = argsStr ? JSON.parse(argsStr) : {};
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
            var args = argsStr ? JSON.parse(argsStr) : {};
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

    // Router function called from UI
    run: function(argsStr) {
        var args = JSON.parse(argsStr);
        
        if (args.action === 'organizeProject') return this.organizeProject(argsStr);
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
        
        return MotionreisUtils.sendError("Pipeline function not yet implemented.");
    }
};
