<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Motionreis SUITE</title>
    <!-- Use standard link for Google Fonts to prevent CEF @import bugs -->
    <link rel="stylesheet" href="../../shared/theme.css">
    <style>
.setting-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        select { background: var(--bg-hover); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; padding: 6px; outline: none; }
        .toggle-btn { background: var(--bg-active); border: 1px solid var(--border-strong); padding: 4px 12px; border-radius: 12px; cursor: pointer; color: var(--text-muted); transition: 0.2s;}
        .toggle-btn.on { background: var(--accent-success); color: white; border-color: transparent;}
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .color-swatch { width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--border-strong); cursor: pointer; }

        /* Customize Modal */
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center; backdrop-filter: blur(2px); }
        .modal-content { background: var(--bg-card); border: 1px solid var(--border-strong); border-radius: var(--radius-lg); padding: 16px; width: 90%; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; flex-direction: column; }
        .modal-header h3 { margin: 0 0 4px 0; font-size: 14px; color: var(--text-primary); }


        /* Ease Slider (Keyframe Wingman) */
        .ease-slider-wrap { margin-bottom: 14px; }
        .ease-slider-wrap label { font-size: 11px; color: var(--text-secondary); display: flex; justify-content: space-between; margin-bottom: 4px; }
        .ease-slider-wrap label span { color: var(--accent-primary); font-weight: 600; }
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 4px; background: var(--bg-active); border-radius: 2px; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--accent-primary); cursor: pointer; }

        /* Small number input */
        .num-input { width: 52px; background: var(--bg-hover); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; padding: 4px 6px; text-align: center; font-size: 11px; outline: none; }

        /* Section label */
        .section-label { font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }

        /* Smart Panel Emphasis Styles */
        .btn.smart-emphasis {
            background: transparent !important;
            border: 2px solid var(--accent-primary) !important;
            color: var(--accent-primary) !important;
            box-shadow: none !important;
            transition: all 0.2s ease;
        }
        .btn.smart-emphasis .material-symbols-rounded {
            color: var(--accent-primary) !important;
            transition: all 0.2s ease;
        }
        .btn.smart-emphasis:hover {
            background: var(--accent-primary) !important;
            border: 2px solid var(--accent-primary) !important;
            color: #ffffff !important;
        }
        .btn.smart-emphasis:hover .material-symbols-rounded {
            color: #ffffff !important;
        }

        /* Cohesive Card Icon Themes (Default Mode) */
        #card-motiontools .btn .material-symbols-rounded {
            color: #2563eb; /* Pure Royal Blue */
        }
        .create-layers-group .btn .material-symbols-rounded {
            color: #d97706 !important; /* Premium Amber (BEDA WARNA SAMA MOTION TOOLS) */
        }
        #card-pathrigging .btn .material-symbols-rounded {
            color: #2563eb; /* Pure Royal Blue */
        }
        #mod-kinetics .btn .material-symbols-rounded,
        #card-wingman .btn .material-symbols-rounded,
        #card-presets .btn .material-symbols-rounded {
            color: #d97706; /* Amber */
        }
        #card-expressions .btn .material-symbols-rounded {
            color: #9333ea; /* Purple */
        }
        #mod-design .btn .material-symbols-rounded {
            color: #8b5cf6; /* Pure Violet instead of Emerald Green */
        }

        /* Ensure primary buttons always have white text and white icons for proper contrast */
        .btn-primary,
        .btn-primary .material-symbols-rounded,
        body.theme-icons .btn-primary .material-symbols-rounded {
            color: #ffffff !important;
        }

        /* Dynamic Theme Icon Color Override */
        body.theme-icons .btn .material-symbols-rounded {
            color: var(--accent-primary) !important;
        }

        /* Ease preset chips */
        .ease-presets { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
        .ease-chip { background: var(--bg-hover); border: 1px solid var(--border-strong); border-radius: 4px; padding: 3px 8px; font-size: 10px; cursor: pointer; color: var(--text-secondary); transition: 0.15s; }
        .ease-chip:hover { background: var(--accent-primary); color: white; border-color: transparent; }

        /* Ease Library */
        .ease-library { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
        .ease-lib-card {
            background: var(--bg-card); border: 1px solid var(--border-strong);
            border-radius: var(--radius-md); padding: 8px 4px; cursor: pointer; position: relative;
            transition: border-color 0.15s, background 0.15s;
            display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center;
        }
        .ease-lib-card:hover { border-color: var(--accent-primary); background: var(--bg-active); }
        .ease-lib-card .lib-name { 
            font-size: 10px; font-weight: 600; color: var(--text-primary); 
            margin-top: 4px; white-space: nowrap; overflow: hidden; 
            text-overflow: ellipsis; max-width: 100%; 
        }
        .ease-lib-card .lib-vals { font-size: 9px; color: var(--text-secondary); margin-top: 2px; }
        .ease-lib-card .lib-del {
            position: absolute; top: 2px; right: 2px;
            background: transparent; border: none; color: var(--text-muted);
            cursor: pointer; font-size: 14px; line-height: 1; padding: 2px;
            border-radius: 3px; display: flex; align-items: center;
        }
        .ease-lib-card .lib-del:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
        .ease-lib-card svg { display: block; overflow: visible; }
        .lib-empty { font-size: 11px; color: var(--text-muted); text-align: center; padding: 12px 0; }
        .save-row { display: flex; gap: 6px; margin-top: 10px; }
        .save-row input { flex: 1; background: var(--bg-app); border: 1px solid var(--border-strong); color: var(--text-primary); padding: 5px 8px; border-radius: 4px; font-size: 11px; outline: none; }
        .save-row input:focus        .toast.success { border-left-color: var(--accent-success); }
        .toast.error { border-left-color: var(--accent-danger); }
        .toast.info { border-left-color: var(--accent-primary); }
        
        .segmented-control {
            display: flex; align-items: center; justify-content: center;
            padding: 6px; font-size: 10px; color: var(--text-secondary);
            border: 1px solid var(--border-strong); border-radius: 4px;
            cursor: pointer; transition: all 0.2s; background: var(--bg-panel);
        }
        .segmented-control.active {
            background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); font-weight: bold;
        }
        .segmented-control:hover:not(.active) {
            background: var(--bg-app);
        }

        /* Recent Projects Panel styles */
        #card-recent-projects {
            transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            overflow: hidden;
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
            margin-bottom: 16px !important;
        }
        #card-recent-projects.hidden-proj {
            opacity: 0;
            transform: translateY(-20px);
            max-height: 0 !important;
            margin-bottom: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            border-top-width: 0 !important;
            border-bottom-width: 0 !important;
            border-color: transparent !important;
            pointer-events: none;
        }
        .recent-proj-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-strong);
            border-radius: var(--radius-md, 6px);
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
            position: relative;
            overflow: hidden;
        }
        .recent-proj-row:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: var(--accent-primary);
            transform: translateX(4px);
        }
        .recent-proj-row .proj-icon {
            font-size: 20px;
            color: var(--accent-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.85;
            transition: transform 0.2s;
        }
        .recent-proj-row:hover .proj-icon {
            transform: scale(1.1);
        }
        .recent-proj-row .proj-info {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
        }
        .recent-proj-row .proj-name {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .recent-proj-row .proj-path {
            font-size: 9px;
            color: var(--text-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 1px;
            opacity: 0.85;
        }
        .recent-proj-row .proj-time {
            font-size: 9px;
            font-weight: 500;
            color: var(--accent-primary);
            white-space: nowrap;
            margin-left: auto;
            padding-left: 8px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- Global Initial Loader -->
        <div id="app-loader">
            <div class="spinner"></div>
        </div>

        <!-- Sidebar Navigation -->
        <div class="sidebar">
            <!-- HOME -->
            <!-- HOME -->
            <button class="tab-btn active" data-target="mod-home"><span class="material-symbols-rounded">space_dashboard</span> Home</button>
            <hr>
            <button class="tab-btn ae-only" data-target="mod-rigging" data-tooltip="Anchor & Nulls"><span class="material-symbols-rounded">anchor</span> Rigging</button>
            <button class="tab-btn ae-only" data-target="mod-kinetics" data-tooltip="Wingman & Expr"><span class="material-symbols-rounded">tune</span> Kinetics</button>
            <button class="tab-btn ae-only" data-target="mod-design" data-tooltip="Text & Layout"><span class="material-symbols-rounded">match_case</span> Design</button>

            <button class="tab-btn ae-only" data-target="mod-output" data-tooltip="Render & VFX"><span class="material-symbols-rounded">movie</span> Render</button>
            <button class="tab-btn pr-only" data-target="mod-loader" data-tooltip="AI Loader"><span class="material-symbols-rounded">psychology</span> AI Loader</button>
            <button class="tab-btn pr-only" data-target="mod-chat" data-tooltip="AI Command"><span class="material-symbols-rounded">terminal</span> AI Command</button>
            <button class="tab-btn pr-only" data-target="mod-clipper" data-tooltip="AI Clipper"><span class="material-symbols-rounded">content_cut</span> AI Clipper</button>
            <div style="flex-grow:1;"></div>
            <button class="tab-btn" data-target="mod-backup" data-tooltip="Project &amp; Sync"><span class="material-symbols-rounded">folder_managed</span> Project</button>
            <button class="tab-btn" data-target="mod-info" data-tooltip="Info & Help"><span class="material-symbols-rounded">settings</span> Info</button>
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
            <!-- HOME -->
            <div id="mod-home" class="module-container active">
                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <span><span class="material-symbols-rounded" style="vertical-align:bottom; margin-right:4px;">space_dashboard</span> Dashboard</span>
                    <button class="btn" style="padding:4px 8px; font-size:10px;" onclick="openCustomizeModal()"><span class="material-symbols-rounded" style="font-size:12px; margin-right:4px;">settings</span>Customize</button>
                </div>
                
                <!-- Recent Projects Card -->
                <div class="card ae-only" id="card-recent-projects" style="display:none;">
                    <div class="section-label" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span>Recent Projects</span>
                        <span class="material-symbols-rounded" style="font-size:14px; opacity:0.6; color:var(--accent-primary);">history</span>
                    </div>
                    <div id="recent-projects-list" style="display:flex; flex-direction:column; gap:8px;">
                        <!-- JS populated -->
                    </div>
                </div>
                
                <div id="home-widgets" style="display:flex; flex-direction:column; gap:16px;"></div>
                <!-- Source Templates (Hidden) -->
                <!-- Welcome Banner -->
                <div class="card" id="card-welcome" style="display:none; text-align:center; padding:24px 16px; background:linear-gradient(135deg, rgba(88, 101, 242, 0.1) 0%, rgba(30, 31, 34, 0) 100%); border:1px solid var(--border-strong); position:relative; overflow:hidden;">
                    <span class="material-symbols-rounded" style="position:absolute; font-size:120px; color:rgba(88, 101, 242, 0.05); top:-20px; right:-20px; transform:rotate(-15deg); pointer-events:none;">rocket_launch</span>
                    <div style="font-size:20px; font-weight:800; color:var(--text-primary); margin-bottom:2px; letter-spacing:0.5px;">MOTIONREIS</div>
                    <div style="font-size:10px; font-weight:600; color:var(--accent-primary); margin-bottom:12px; letter-spacing:2px; text-transform:uppercase;">Master Suite</div>
                    <p style="font-size:11px; color:var(--text-secondary); margin:0; line-height:1.5;">Welcome to your ultimate pipeline companion. Organize files, rig characters, and automate workflows effortlessly.</p>
                </div>
                


                <div class="card ae-only" id="card-memory" style="display:none;">
                    <div class="section-label">Memory Utilities</div>
                    <div class="grid-2">
                        <button class="btn" style="justify-content:center; color:var(--accent-warning); border-color:var(--border-strong);" onclick="exec('pipeline', 'purgeCache')" title="Purge AE Cache">
                            <span class="material-symbols-rounded" style="color:var(--accent-warning);">cleaning_services</span> AE Cache
                        </button>
                        <button class="btn" style="justify-content:center; color:var(--accent-danger); border-color:var(--border-strong);" onclick="purgeOSRAM()" title="Purge System RAM (OS Level)">
                            <span class="material-symbols-rounded" style="color:var(--accent-danger);">memory</span> OS RAM
                        </button>
                    </div>

                    </div>
                </div>

            <!-- RIGGING -->
            <div id="mod-rigging" class="module-container">
                <div class="module-header"><span class="material-symbols-rounded">anchor</span> Rigging</div>
                <div class="card" id="card-anchor">
                    <div class="section-label">Anchor Point</div>
                    <div style="display:flex; justify-content:center; align-items:center; gap: 20px; padding: 10px 0;">
                    <div style="display:grid; grid-template-columns: repeat(3, 30px); gap: 4px;">
                        <button class="btn" style="height:30px; padding:0; justify-content:center;" onclick="exec('motion','TL', {comp: document.getElementById('anchor-compensate').checked})"><span class="material-symbols-rounded" style="transform:rotate(-45deg); font-size:16px;">arrow_upward</span></button>
                        <button class="btn" style="height:30px; padding:0; justify-content:center;" onclick="exec('motion','TC', {comp: document.getElementById('anchor-compensate').checked})"><span class="material-symbols-rounded" style="font-size:16px;">arrow_upward</span></button>
                        <button class="btn" style="height:30px; padding:0; justify-content:center;" onclick="exec('motion','TR', {comp: document.getElementById('anchor-compensate').checked})"><span class="material-symbols-rounded" style="transform:rotate(45deg); font-size:16px;">arrow_upward</span></button>
                        <button class="btn" style="height:30px; padding:0; justify-content:center;" onclick="exec('motion','ML', {comp: document.getElementById('anchor-compensate').checked})"><span class="material-symbols-rounded" style="transform:rotate(-90deg); font-size:16px;">arrow_upward</span></button>
                        <button class="btn" style="height:30px; padding:0; justify-content:center;" onclick="exec('motion','MC', {comp: document.getElementById('anchor-compensate').checked})"><span class="material-symbols-rounded" style="font-size:14px">fiber_manual_record</span></button>
                        <button class="btn" style="height:30px; padding:0; justify-content:center;" onclick="exec('motion','MR', {comp: document.getElementById('anchor-compensate').checked})"><span class="material-symbols-rounded" style="transform:rotate(90deg); font-size:16px;">arrow_upward</span></button>
                        <button class="btn" style="height:30px; padding:0; justify-content:center;" onclick="exec('motion','BL', {comp: document.getElementById('anchor-compensate').checked})"><span class="material-symbols-rounded" style="transform:rotate(-135deg); font-size:16px;">arrow_upward</span></button>
                        <button class="btn" style="height:30px; padding:0; justify-content:center;" onclick="exec('motion','BC', {comp: document.getElementById('anchor-compensate').checked})"><span class="material-symbols-rounded" style="transform:rotate(180deg); font-size:16px;">arrow_upward</span></button>
                        <button class="btn" style="height:30px; padding:0; justify-content:center;" onclick="exec('motion','BR', {comp: document.getElementById('anchor-compensate').checked})"><span class="material-symbols-rounded" style="transform:rotate(135deg); font-size:16px;">arrow_upward</span></button>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:10px;"><input type="checkbox" id="anchor-compensate" checked> Compensate Pos</label>
                    </div>
                </div>
                </div>
                <div class="card" id="card-motiontools">
                    <div class="section-label" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>Motion Tools</span>
                        <label style="font-size:10px; font-weight:normal; display:flex; align-items:center; gap:4px; margin:0; text-transform:none; letter-spacing:0;"><input type="checkbox" id="null-3d"> 3D Null</label>
                    </div>

                    <!-- Shapes & Nulls -->
                    <div class="grid-3" style="margin-bottom:8px;">
                        <button class="btn" onclick="exec('motion','nullFromSelection', {null3d: document.getElementById('null-3d').checked})" title="Create Null"><span class="material-symbols-rounded" style="font-size:16px;">center_focus_strong</span> Null</button>
                        <button class="btn" onclick="exec('layers','explodeShapeLayer')" title="Extract Shape"><span class="material-symbols-rounded" style="font-size:16px;">call_split</span> Extract</button>
                        <button class="btn" onclick="exec('layers','mergeShapeLayers')" title="Merge Shapes"><span class="material-symbols-rounded" style="font-size:16px;">call_merge</span> Merge</button>
                    </div>
                    
                    <!-- Keys -->
                    <div class="grid-3" style="margin-bottom:8px;">
                        <button class="btn" onclick="exec('motion','cloneKeys')" title="Clone Keys"><span class="material-symbols-rounded" style="font-size:16px;">content_copy</span> Clone</button>
                        <button class="btn" onclick="exec('motion','reverseKeys')" title="Reverse Keys"><span class="material-symbols-rounded" style="font-size:16px;">compare_arrows</span> Reverse</button>
                        <button class="btn" onclick="exec('motion','snapKeys')" title="Snap Keys (Fix Sub-frames)"><span class="material-symbols-rounded" style="font-size:16px;">align_horizontal_center</span> Snap</button>
                    </div>

                    <!-- Comp & Render Tools -->
                    <div class="grid-3" style="margin-bottom:8px;">
                        <button class="btn" onclick="exec('layers','preRender')" title="Precompose Selected Layers"><span class="material-symbols-rounded" style="font-size:16px;">folder_zip</span> Precomp</button>
                        <button class="btn" onclick="exec('motion','autoPrecompCrop')" title="Crop Comp Duration to Tightest Bounds"><span class="material-symbols-rounded" style="font-size:16px;">crop</span> Crop Comp</button>
                        <button class="btn" onclick="exec('pipeline','addToRenderQueue')" title="Add Active Comp to AE Render Queue"><span class="material-symbols-rounded" style="font-size:16px;">add_to_queue</span> Add RQ</button>
                    </div>
                    
                    <!-- Sequence Control -->
                    <div style="display:flex; align-items:center; gap:6px; background:var(--bg-active); border:1px solid var(--border-strong); border-radius:var(--radius-md); padding:4px;">
                        <span style="font-size:11px; color:var(--text-secondary); margin-left:4px;"><span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle; margin-right:4px;">format_list_numbered</span>Seq</span>
                        <input type="number" id="mt-sequence-frames" value="2" style="width:36px; text-align:center; padding:2px; font-size:11px; background:var(--bg-app); border:1px solid var(--border-strong); color:var(--text-primary); border-radius:4px; outline:none; margin-left:auto;">
                        <button class="btn" style="flex:1; justify-content:center; padding:2px 0;" onclick="exec('motion','staggerLayers', {frames: document.getElementById('mt-sequence-frames').value})">Layers</button>
                        <button class="btn" style="flex:1; justify-content:center; padding:2px 0;" onclick="exec('motion','staggerKeys', {frames: document.getElementById('mt-sequence-frames').value})">Keys</button>
                    </div>

                    <!-- Quick Layers -->
                    <div class="section-label" style="margin-top:12px; margin-bottom:6px;">Create Layers</div>
                    <div class="create-layers-group">
                        <div class="grid-3" style="margin-bottom:6px;">
                            <button class="btn" onclick="exec('motion','createNewLayer', {type: 'solid'})" title="Create Solid Layer"><span class="material-symbols-rounded" style="font-size:16px;">layers</span> Solid</button>
                            <button class="btn" onclick="exec('motion','createNewLayer', {type: 'adjustment'})" title="Create Adjustment Layer"><span class="material-symbols-rounded" style="font-size:16px;">blur_on</span> Adjust</button>
                            <button class="btn" onclick="exec('motion','createNewLayer', {type: 'text'})" title="Create Text Layer"><span class="material-symbols-rounded" style="font-size:16px;">title</span> Text</button>
                        </div>
                        <div class="grid-3">
                            <button class="btn" onclick="exec('motion','createNewLayer', {type: 'shape'})" title="Create Shape Layer"><span class="material-symbols-rounded" style="font-size:16px;">category</span> Shape</button>
                            <button class="btn" onclick="exec('motion','createNewLayer', {type: 'camera'})" title="Create Camera Layer"><span class="material-symbols-rounded" style="font-size:16px;">videocam</span> Camera</button>
                            <button class="btn" onclick="exec('motion','createNewLayer', {type: 'light'})" title="Create Light Layer"><span class="material-symbols-rounded" style="font-size:16px;">lightbulb</span> Light</button>
                        </div>
                    </div>
                </div>
                
                <div class="card" id="card-pathrigging">
                    <div class="section-label">Path Rigging</div>
                    <div class="grid-3" style="margin-top:6px;">
                        <button class="btn" onclick="exec('motion','pointsFollowNulls')" title="Points Follow Nulls">Pts &rarr; Null</button>
                        <button class="btn" onclick="exec('motion','nullsFollowPoints')" title="Nulls Follow Points">Null &rarr; Pts</button>
                        <button class="btn" onclick="exec('motion','tracePath')" title="Trace Path">Trace</button>
                    </div>
                </div>
                <div class="card" id="card-camerarig">
                    <div class="section-label">Camera Rig</div>
                    <button class="btn" style="width:100%; margin-bottom:8px;" onclick="exec('creative', 'addHandheldShake')"><span class="material-symbols-rounded">vibration</span> Add Handheld Shake</button>
                    <button class="btn" style="width:100%; margin-bottom:8px;" onclick="exec('creative', 'generateParallaxRig')"><span class="material-symbols-rounded">video_camera_front</span> Generate Parallax Rig</button>
                    <button class="btn" style="width:100%;" onclick="exec('creative', 'toggleCameraNode')"><span class="material-symbols-rounded">sync_alt</span> Toggle 1-Node / 2-Node</button>
                </div>
                <div class="card" id="card-layergroupingworkflowerlite">
                    <div class="section-label">Layer Grouping (Workflower Lite)</div>
                    <button class="btn btn-primary" style="width:100%; justify-content:center;" onclick="exec('pipeline', 'groupSelectedLayers')"><span class="material-symbols-rounded">folder_zip</span> Group to Null</button>
                </div>
                <div class="card" id="card-timeshift">
                    <div class="section-label">VFX Data Bridge</div>
                    <div style="display:flex; gap:6px; margin-bottom:8px;">
                        <select id="vfx-export-format" style="width:80px; padding:0 4px;  background:var(--bg-app); border:1px solid var(--border-strong); color:var(--text-primary); border-radius:4px;">
                            <option value="chan">.chan</option>
                            <option value="python">Python</option>
                        </select>
                        <button class="btn btn-primary" style="flex:1; justify-content:center; padding:0; " onclick="exec('pipeline', 'exportVFXData', {format: document.getElementById('vfx-export-format').value})">Export Transform Data</button>
                    </div>
                </div>
                <div class="card" id="card-deepduplicator" style="padding:12px; display:flex; flex-direction:column; gap:16px;">
                    <div>
                        <div class="section-label" style="display:flex; justify-content:space-between; align-items:center;">
                            <span>Deep Duplicator</span>
                            <button class="btn" style="padding:2px; height:auto; width:auto; border:none; background:transparent;" title="Help" onclick="window.cep.util.openURLInDefaultBrowser('https://github.com/motionreis')">
                                <span class="material-symbols-rounded" style="font-size:14px; color:var(--text-secondary);">help</span>
                            </button>
                        </div>
                        <p style="font-size:10px; color:var(--text-secondary); margin-top:4px; margin-bottom:0; line-height:1.4;">Advanced composition duplicator. Select a comp to begin.</p>
                    </div>
                    
                    <!-- Naming Rules -->
                    <div style="background:var(--bg-app); border:1px solid var(--border-strong); border-radius:6px; padding:10px;">
                        <div style="font-size:10px; color:var(--accent-primary); font-weight:600; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">Naming Rules</div>
                        
                        <div class="grid-2" style="margin-bottom:8px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:10px; color:var(--text-primary); cursor:pointer;">
                                <input type="checkbox" id="dup-fix-cb" checked>
                                <select id="dup-fix-type" style="background:transparent; border:none; color:var(--text-secondary); outline:none; cursor:pointer;">
                                    <option value="suffix">Suffix</option>
                                    <option value="prefix">Prefix</option>
                                </select>
                            </label>
                            <input type="text" id="dup-fix-text" value="_v2" placeholder="Text..." style="width:100%; background:var(--bg-hover); color:var(--text-primary); border:1px solid var(--border-strong); border-radius:4px; padding:4px; font-size:10px; outline:none;">
                        </div>

                        <div class="grid-2" style="margin-bottom:8px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:10px; color:var(--text-primary); cursor:pointer;">
                                <input type="checkbox" id="dup-replace-cb"> Replace
                            </label>
                            <div style="display:flex; gap:4px;">
                                <input type="text" id="dup-search-text" placeholder="Find" style="width:50%; background:var(--bg-hover); color:var(--text-primary); border:1px solid var(--border-strong); border-radius:4px; padding:4px; font-size:10px; outline:none;">
                                <input type="text" id="dup-replace-text" placeholder="New" style="width:50%; background:var(--bg-hover); color:var(--text-primary); border:1px solid var(--border-strong); border-radius:4px; padding:4px; font-size:10px; outline:none;">
                            </div>
                        </div>

                        <div class="grid-2">
                            <label style="display:flex; align-items:center; gap:6px; font-size:10px; color:var(--text-primary); cursor:pointer;">
                                <input type="checkbox" id="dup-inc-cb"> Auto-Increment
                            </label>
                            <select id="dup-inc-type" style="width:100%; background:var(--bg-hover); border:1px solid var(--border-strong); color:var(--text-primary); border-radius:4px; padding:4px; font-size:10px; outline:none; cursor:pointer;">
                                <option value="last">Last Number in Name</option>
                                <option value="first">First Number in Name</option>
                            </select>
                        </div>
                    </div>

                    <!-- Behaviors -->
                    <div style="background:var(--bg-app); border:1px solid var(--border-strong); border-radius:6px; padding:10px;">
                        <div style="font-size:10px; color:var(--accent-primary); font-weight:600; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">Behaviors & Filtering</div>
                        
                        <div class="grid-2" style="margin-bottom:8px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:10px; color:var(--text-primary); cursor:pointer;">
                                <input type="checkbox" id="dup-folder-cb"> Group to Folder
                            </label>
                            <input type="text" id="dup-folder-name" placeholder="Folder Name..." style="width:100%; background:var(--bg-hover); color:var(--text-primary); border:1px solid var(--border-strong); border-radius:4px; padding:4px; font-size:10px; outline:none;">
                        </div>

                        <div class="grid-2" style="margin-bottom:8px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:10px; color:var(--text-primary); cursor:pointer;">
                                <input type="checkbox" id="dup-exclude-cb"> Exclude Items
                            </label>
                            <div style="display:flex; gap:4px;">
                                <select id="dup-exclude-type" style="width:50%; background:var(--bg-hover); border:1px solid var(--border-strong); color:var(--text-secondary); border-radius:4px; padding:4px; font-size:10px; outline:none; cursor:pointer;">
                                    <option value="prefix">Starts with</option>
                                    <option value="suffix">Ends with</option>
                                </select>
                                <input type="text" id="dup-exclude-text" value="_" style="width:50%; background:var(--bg-hover); color:var(--text-primary); border:1px solid var(--border-strong); border-radius:4px; padding:4px; font-size:10px; outline:none;">
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:10px; color:var(--text-secondary); cursor:pointer;">
                                <input type="checkbox" id="dup-expr-cb" checked> Auto-Update Expressions
                            </label>
                            <label style="display:flex; align-items:center; gap:6px; font-size:10px; color:var(--text-secondary); cursor:pointer;">
                                <input type="checkbox" id="dup-footage-cb"> Duplicate Footage Assets (Slower)
                            </label>
                            <label style="display:flex; align-items:center; gap:6px; font-size:10px; color:var(--text-secondary); cursor:pointer;">
                                <input type="checkbox" id="dup-solids-cb"> Duplicate Solids
                            </label>
                        </div>
                    </div>

                    <!-- Output & Actions -->
                    <div style="display:flex; gap:8px;">
                        <button class="btn" style="flex:1; justify-content:center; border:1px solid var(--border-strong);" onclick="exec('pipeline', 'collectDependencies')">
                            <span class="material-symbols-rounded" style="font-size:14px;">inventory_2</span> Collect Assets
                        </button>
                        <select id="dup-color-val" style="width:90px; background:var(--bg-hover); border:1px solid var(--border-strong); color:var(--text-secondary); border-radius:4px; padding:4px; font-size:10px; outline:none; cursor:pointer;" title="Apply Label Color">
                            <option value="0">No Color</option>
                            <option value="1">Red</option>
                            <option value="2">Yellow</option>
                            <option value="8">Blue</option>
                            <option value="9">Green</option>
                            <option value="10">Purple</option>
                            <option value="11">Orange</option>
                        </select>
                    </div>

                    <div style="display:flex; gap:8px; align-items:center; background:var(--bg-app); border:1px solid var(--border-strong); border-radius:6px; padding:8px;">
                        <span style="font-size:11px; color:var(--text-primary); margin-left:4px;">Copies</span>
                        <input type="number" id="dup-copies" value="1" min="1" max="50" style="width:40px; background:var(--bg-hover); color:var(--text-primary); border:1px solid var(--border-strong); border-radius:4px; padding:6px; font-size:11px; outline:none; text-align:center;">
                        <button class="btn btn-primary" style="flex:1; justify-content:center; padding:8px; font-size:11px;" onclick="runDeepDuplicator()">
                            Deep Duplicate
                        </button>
                    </div>
                </div>
                <div class="card" id="card-macro">
                    <div class="section-label">Custom Scripts</div>
                    <div class="grid-compact" id="macro-grid">
                        <button class="ease-chip" onclick="exec('pipeline', 'runMacro', {id: 1})">S1</button>
                        <button class="ease-chip" onclick="exec('pipeline', 'runMacro', {id: 2})">S2</button>
                        <button class="ease-chip" onclick="exec('pipeline', 'runMacro', {id: 3})">S3</button>
                        <button class="ease-chip" onclick="exec('pipeline', 'runMacro', {id: 4})">S4</button>
                    </div>
                </div>
            </div>

            <!-- KINETICS -->
            <div id="mod-kinetics" class="module-container">
                <div class="module-header"><span class="material-symbols-rounded">tune</span> Kinetics</div>
                <div class="card" id="card-wingman">
                    <div class="section-label">Keyframe Wingman</div>
                    <!-- Top section: Graph (Left), Controls (Right) -->
                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 12px; margin-bottom: 10px;">
                        <!-- LEFT: GRAPH -->
                        <div style="background:var(--bg-active); border:1px solid var(--border-strong); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; height: 80px;">
                            <svg id="wingman-preview" width="70" height="70" viewBox="0 0 80 80" style="overflow:visible;">
                                <!-- Map the 0-80, 0-40 original path into an 80x80 box, so scale Y by 2 -->
                                <path id="wingman-curve" d="" stroke="var(--accent-primary)" stroke-width="3" fill="none" />
                                <line x1="0" y1="80" x2="80" y2="0" stroke="var(--border-strong)" stroke-width="1.5" stroke-dasharray="3,3"/>
                            </svg>
                        </div>
                        
                        <!-- RIGHT: SLIDERS & BUTTONS -->
                        <div style="display: flex; flex-direction: column; justify-content: space-between;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:10px; color:var(--text-secondary); width:20px;">Out</span>
                                <input type="range" id="ease-out-slider" min="0" max="100" value="66" style="flex:1; height:4px;" oninput="document.getElementById('ease-out-val-input').value=this.value; updateWingmanPreview()">
                                <input type="number" id="ease-out-val-input" value="66" min="0" max="100" style="width: 36px; text-align:center; font-size:10px; background:var(--bg-app); border:1px solid var(--border-strong); border-radius:4px; padding:2px; color:var(--text-primary);" oninput="document.getElementById('ease-out-slider').value=this.value; updateWingmanPreview()">
                            </div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:10px; color:var(--text-secondary); width:20px;">In</span>
                                <input type="range" id="ease-in-slider" min="0" max="100" value="66" style="flex:1; height:4px;" oninput="document.getElementById('ease-in-val-input').value=this.value; updateWingmanPreview()">
                                <input type="number" id="ease-in-val-input" value="66" min="0" max="100" style="width: 36px; text-align:center; font-size:10px; background:var(--bg-app); border:1px solid var(--border-strong); border-radius:4px; padding:2px; color:var(--text-primary);" oninput="document.getElementById('ease-in-slider').value=this.value; updateWingmanPreview()">
                            </div>
                            <div class="grid-3" style="margin-top:2px;">
                                <button class="btn btn-primary" style="justify-content:center; padding:0; " onclick="applyWingman('both')">Apply</button>
                                <button class="btn" style="justify-content:center; padding:0; " onclick="applyWingman('out')">Out</button>
                                <button class="btn" style="justify-content:center; padding:0; " onclick="applyWingman('in')">In</button>
                            </div>
                        </div>
                    </div>

                    <div class="grid-2" style="margin-bottom:8px;">
                        <button class="btn" style="justify-content:center; padding:0;  font-size:10px;" onclick="exec('motion', 'copyEase')" title="Extract Bezier Data without spatial values">Copy Ease</button>
                        <button class="btn" style="justify-content:center; padding:0;  font-size:10px;" onclick="exec('motion', 'pasteEase')" title="Inject Bezier Data">Paste Ease</button>
                    </div>

                    <!-- Bottom section: Quick Presets -->
                    <div class="grid-compact">
                        <button class="ease-chip" onclick="setWingman(0, 0)" title="Linear">LIN</button>
                        <button class="ease-chip" onclick="setWingman(33, 33)" title="Easy Ease">EAS</button>
                        <button class="ease-chip" onclick="setWingman(75, 75)" title="Strong">STR</button>
                        <button class="ease-chip" onclick="setWingman(100, 100)" title="Max">MAX</button>
                        <button class="ease-chip" onclick="setWingman(0, 100)" title="Ease In">IN</button>
                        <button class="ease-chip" onclick="setWingman(100, 0)" title="Ease Out">OUT</button>
                        <button class="ease-chip" onclick="setWingman(80, -20)" title="Overshoot">OVR</button>
                    </div>
                </div>

                <div class="card" id="card-myeaselibrary">
                    <div class="section-label">My Ease Library</div>
                    <div style="display:flex; gap:6px; margin-bottom:8px;">
                        <input type="text" id="ease-save-name" placeholder="Save current ease..." style="flex:1;  font-size:11px; padding:0 8px; background:var(--bg-app); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary);">
                        <button class="btn btn-primary" style=" padding:0 8px; justify-content:center;" onclick="saveEasePreset()"><span class="material-symbols-rounded" style="font-size:14px;">save</span></button>
                    </div>
                    <div id="ease-lib-list" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                        <!-- JS populated -->
                    </div>
                </div>

                <div class="card" id="card-wigglepro">
                    <div class="section-label">Wiggle Pro</div>
                    <div style="text-align:center; padding: 10px 0; display:flex; justify-content:center;">
                        <svg width="180" height="40" viewBox="0 0 180 40" style="stroke: var(--accent-primary); stroke-width: 2.5; stroke-linecap: round; fill: none;">
                            <path id="wiggle-curve" d=""></path>
                        </svg>
                    </div>
                    <div class="setting-row">
                        <span style="font-size:11px; color:var(--text-secondary);">Freq</span>
                        <span id="wig-freq-val" style="font-weight:bold; font-size:11px;">2.0</span>
                    </div>
                    <input type="range" id="wig-freq" min="0.1" max="20" step="0.1" value="2.0" style="width:100%; margin-bottom:8px;" oninput="document.getElementById('wig-freq-val').innerText=this.value; updateWigglePreview();">
                    <div class="setting-row">
                        <span style="font-size:11px; color:var(--text-secondary);">Amp</span>
                        <span id="wig-amp-val" style="font-weight:bold; font-size:11px;">50</span>
                    </div>
                    <input type="range" id="wig-amp" min="1" max="500" step="1" value="50" style="width:100%; margin-bottom:12px;" oninput="document.getElementById('wig-amp-val').innerText=this.value; updateWigglePreview();">
                    <div class="grid-2" style="align-items:center;">
                        <label style="font-size:10px;"><input type="checkbox" id="wig-loop"> Loopable</label>
                        <button class="btn btn-primary" onclick="applyWiggle()">
                            <span class="material-symbols-rounded">bolt</span> Apply
                        </button>
                        <script>
                        function applyWiggle() {
                            var freq = document.getElementById('wig-freq').value;
                            var amp = document.getElementById('wig-amp').value;
                            var loop = document.getElementById('wig-loop').checked;
                            exec('motion', 'applyWiggle', { freq: freq, amp: amp, loop: loop });
                        }

                        // ── OS RAM Purge ────────────────────────────────────────────────
                        function purgeOSRAM() {
                            var os = require('os');
                            var cp = require('child_process');
                            var isMac = os.platform() === 'darwin';

                            if (isMac) {
                                showToast("Requesting Admin access to purge RAM...", "success");
                                // Uses AppleScript to prompt for password natively
                                cp.exec('osascript -e \'do shell script "purge" with administrator privileges\'', function(err, stdout, stderr) {
                                    if (err) {
                                        showToast("RAM Purge Cancelled or Failed.", "error");
                                    } else {
                                        showToast("System RAM Purged Successfully!", "success");
                                    }
                                });
                            } else {
                                showToast("Processing System Idle Tasks...", "success");
                                // Windows doesn't have a direct 'sudo purge', so we trigger ProcessIdleTasks to flush memory 
                                cp.exec('rundll32.exe advapi32.dll,ProcessIdleTasks', function(err, stdout, stderr) {
                                    showToast("System Memory Optimized.", "success");
                                });
                            }
                        }
                        </script>
                    </div>
                </div>

                <div class="card" id="card-expression">
                    <div class="section-label">Master Linker</div>
                    <button class="btn btn-primary" style="width:100%; justify-content:center;" onclick="exec('motion','masterExpressionLinker')" title="Bind selected properties to a Master Null">Bind to Master Null</button>
                </div>

                <div class="card" id="card-utilities">
                    <div class="section-label">Utilities</div>
                    <button class="btn" style="width:100%; color:var(--text-primary); border-color:var(--accent-warning);" onclick="exec('motion','bakeExpressions')"><span class="material-symbols-rounded">cookie</span> Bake Expressions to Keys</button>
                </div>

                <div class="card" id="card-expressionengine">
                    <div class="section-label">Expression Engine</div>
                    
                    <!-- Loop -->
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                        <span style="font-size:11px; color:var(--text-secondary); width:45px;">Loop</span>
                        <select id="expr-loop-type" style="width:60px; padding:4px; font-size:10px; background:var(--bg-hover); border:1px solid var(--border-strong); color:var(--text-primary); border-radius:4px; outline:none;">
                            <option value="cycle">Cycle</option>
                            <option value="pingpong">PingPong</option>
                            <option value="continue">Continue</option>
                            <option value="offset">Offset</option>
                        </select>
                        <button class="btn" style="flex:1; justify-content:center; padding:4px 0; font-size:10px;" onclick="exec('motion','applyLoop', {type: document.getElementById('expr-loop-type').value, io: 'out'})">Out</button>
                        <button class="btn" style="flex:1; justify-content:center; padding:4px 0; font-size:10px;" onclick="exec('motion','applyLoop', {type: document.getElementById('expr-loop-type').value, io: 'in'})">In</button>
                    </div>

                    <!-- Wiggle (Basic + X/Y) -->
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                        <span style="font-size:11px; color:var(--text-secondary); width:45px;">Wiggle</span>
                        <button class="btn" style="flex:1; justify-content:center; padding:4px 0; font-size:10px;" onclick="exec('pipeline', 'applyIDEExpression', {expression: 'wiggle(5, 20);'})">Basic</button>
                        <button class="btn" style="flex:1; justify-content:center; padding:4px 0; font-size:10px;" onclick="exec('pipeline', 'applyIDEExpression', {expression: 'var w = wiggle(5, 50);\n[w[0], value[1]];'})">X-Only</button>
                        <button class="btn" style="flex:1; justify-content:center; padding:4px 0; font-size:10px;" onclick="exec('pipeline', 'applyIDEExpression', {expression: 'var w = wiggle(5, 50);\n[value[0], w[1]];'})">Y-Only</button>
                    </div>

                    <!-- Time -->
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                        <span style="font-size:11px; color:var(--text-secondary); width:45px;">Time</span>
                        <input type="number" id="expr-time-speed" value="100" style="width:60px; text-align:center; padding:4px; font-size:10px; background:var(--bg-hover); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); outline:none;">
                        <button class="btn" style="flex:1; justify-content:center; padding:4px 0; font-size:10px;" onclick="exec('pipeline', 'applyIDEExpression', {expression: 'time * ' + document.getElementById('expr-time-speed').value})">Apply</button>
                    </div>

                    <!-- Posterize Time -->
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                        <span style="font-size:11px; color:var(--text-secondary); width:45px;">StopMo</span>
                        <input type="number" id="expr-posterize-fps" value="12" style="width:60px; text-align:center; padding:4px; font-size:10px; background:var(--bg-hover); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); outline:none;">
                        <button class="btn" style="flex:1; justify-content:center; padding:4px 0; font-size:10px;" onclick="exec('pipeline', 'applyIDEExpression', {expression: 'posterizeTime(' + document.getElementById('expr-posterize-fps').value + ');\nvalue;'})">Apply</button>
                    </div>

                    <!-- Delay -->
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                        <span style="font-size:11px; color:var(--text-secondary); width:45px;">Delay (s)</span>
                        <input type="number" id="expr-delay-sec" value="0.5" step="0.1" style="width:60px; text-align:center; padding:4px; font-size:10px; background:var(--bg-hover); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); outline:none;">
                        <button class="btn" style="flex:1; justify-content:center; padding:4px 0; font-size:10px;" onclick="exec('pipeline', 'applyIDEExpression', {expression: 'var delay = ' + document.getElementById('expr-delay-sec').value + ';\nvalueAtTime(time - delay);'})">Apply</button>
                    </div>

                    <!-- Random -->
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                        <span style="font-size:11px; color:var(--text-secondary); width:45px;">Random</span>
                        <div style="display:flex; gap:4px; width:60px;">
                            <input type="number" id="expr-rnd-min" value="0" style="width:100%; text-align:center; padding:4px 0; font-size:10px; background:var(--bg-hover); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); outline:none;">
                            <input type="number" id="expr-rnd-max" value="100" style="width:100%; text-align:center; padding:4px 0; font-size:10px; background:var(--bg-hover); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary); outline:none;">
                        </div>
                        <button class="btn" style="flex:1; justify-content:center; padding:4px 0; font-size:10px;" onclick="exec('pipeline', 'applyIDEExpression', {expression: 'random(' + document.getElementById('expr-rnd-min').value + ', ' + document.getElementById('expr-rnd-max').value + ');'})">Apply</button>
                    </div>
                    
                    <!-- One Click: Physics & Math -->
                    <div class="grid-3" style="margin-bottom:12px;">
                        <button class="btn" style="justify-content:center; font-size:10px; padding:4px;" onclick="exec('pipeline', 'applyIDEExpression', {expression: 'linear(time, 0, 1, 0, 100);'})">Linear Map</button>
                        <button class="btn" style="justify-content:center; font-size:10px; padding:4px;" onclick="exec('pipeline', 'applyIDEExpression', {expression: 'Math.round(value);'})">Math.round()</button>
                        <button class="btn" style="justify-content:center; font-size:10px; padding:4px;" onclick="exec('pipeline', 'applyIDEExpression', {expression: 'var n = 0;\nif (numKeys > 0) {\n  n = nearestKey(time).index;\n  if (key(n).time > time) { n--; }\n}\nif (n == 0) { value; }\nelse {\n  var t = time - key(n).time;\n  if (n > 1) {\n    var v1 = key(n-1).value;\n    var v2 = key(n).value;\n    var freq = 3;\n    var decay = 5;\n    var amp = (v2 - v1) / (key(n).time - key(n-1).time);\n    var w = freq * Math.PI * 2;\n    value + amp * (Math.sin(t*w)/Math.exp(decay*t))/w;\n  } else { value; }\n}'})">Inertia</button>
                        <button class="btn" style="justify-content:center; font-size:10px; padding:4px;" onclick="exec('motion','applyBounce')">Bounce</button>
                        <button class="btn" style="justify-content:center; font-size:10px; padding:4px;" onclick="exec('motion','applyElastic')">Elastic</button>
                        <button class="btn" style="justify-content:center; font-size:10px; padding:4px;" onclick="exec('motion','applyAutoSway')">Sway</button>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; padding-top:8px; border-top:1px solid var(--border-strong);">
                        <span style="font-size:10px; color:var(--text-secondary);">Custom Code:</span>
                        <div style="display:flex; gap:4px;">
                            <select id="expr-lib-select" style="width:60px; padding:2px; font-size:9px; background:var(--bg-app); border:1px solid var(--border-strong); color:var(--text-primary); border-radius:4px;" onchange="if(this.value) document.getElementById('ideInput').value=this.value;">
                                <option value="">Saved...</option>
                            </select>
                            <button class="btn" style="padding:2px 6px; font-size:9px;" onclick="saveExprPreset()" title="Save Current Expression"><span class="material-symbols-rounded" style="font-size:12px; margin-right:2px;">save</span> Save</button>
                        </div>
                    </div>
                    <div style="padding:0; overflow:hidden; border:1px solid var(--border-strong);">
                        <textarea id="ideInput" style="width:100%; height:80px; background:#000; color:#10b981; border:none; padding:8px; font-family:monospace; resize:none;" placeholder="// Write your expression here..."></textarea>
                    </div>
                    <div class="grid-2" style="margin-top:8px;">
                        <button class="btn btn-primary" style="justify-content:center; padding:0;" onclick="exec('pipeline', 'applyIDEExpression')">Apply Code</button>
                        <button class="btn" style="justify-content:center; padding:0;" onclick="document.getElementById('ideInput').value=''">Clear</button>
                    </div>
                </div>

                <div class="card" id="card-audioreactive">
                    <div class="section-label">Audio Reactive</div>
                    <button class="btn" style="width:100%; margin-bottom:8px;" onclick="exec('creative', 'audioToKeyframes')"><span class="material-symbols-rounded">graphic_eq</span> Audio to Keyframes</button>
                    <button class="btn" style="width:100%;" onclick="exec('creative', 'generateWaveform')"><span class="material-symbols-rounded">waves</span> Generate Waveform</button>
                </div>
                <div class="card" id="card-transitionshifter">
                    <div class="section-label">Transition Shifter</div>
                    <div class="setting-row" style="margin-bottom:8px;">
                        <span style="font-size:11px; color:var(--text-secondary);">Stagger Frames</span>
                        <input type="number" id="ts-frames" value="3" style="width: 40px; text-align:center; font-size:10px; background:var(--bg-app); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary);">
                    </div>
                    <div style="margin-bottom:8px;">
                        <select id="ts-mode" style="width:100%; padding:4px; background:var(--bg-app); border:1px solid var(--border-strong); color:var(--text-primary); border-radius:4px; font-size:11px;">
                            <option value="asc">Ascending (top → bottom)</option>
                            <option value="desc">Descending (bottom → top)</option>
                            <option value="random">Randomized</option>
                        </select>
                    </div>
                    <div class="grid-3" style="margin-bottom:12px;">
                        <button class="btn" onclick="execTS('layers')">Layers</button>
                        <button class="btn" onclick="execTS('inPoint')">In Point</button>
                        <button class="btn" onclick="execTS('outPoint')">Out Point</button>
                    </div>
                    
                    <div class="setting-row" style="margin-bottom:8px; padding-top:8px; border-top:1px solid var(--border-strong);">
                        <span style="font-size:11px; color:var(--text-secondary);">Shift Frames</span>
                        <input type="number" id="ts-shift" value="5" style="width: 40px; text-align:center; font-size:10px; background:var(--bg-app); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary);">
                    </div>
                    <div class="grid-2" style="margin-bottom:12px;">
                        <button class="btn" onclick="exec('motion','shiftLayers',{frames: document.getElementById('ts-shift').value})">Shift +</button>
                        <button class="btn" onclick="exec('motion','shiftLayers',{frames: -document.getElementById('ts-shift').value})">Shift −</button>
                    </div>

                    <div style="font-size:11px; color:var(--text-secondary); margin-bottom:8px;">Align to Playhead</div>
                    <div class="grid-3">
                        <button class="btn" onclick="exec('motion','alignTransitions',{target:'inPoint'})">In Point</button>
                        <button class="btn" onclick="exec('motion','alignTransitions',{target:'outPoint'})">Out Point</button>
                        <button class="btn" onclick="exec('motion','alignTransitions',{target:'startTime'})">Start</button>
                    </div>
                </div>
                <div class="card" id="card-smartsequencetrim">
                    <div class="section-label">Smart Sequence & Trim</div>
                    <div style="display:flex; gap:6px; margin-bottom:8px;">
                        <input type="number" id="macro-stagger-frames" value="2" min="1" max="60" style="width: 40px; text-align:center; font-size:10px; background:var(--bg-app); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary);">
                        <button class="btn btn-primary" style="flex:1; justify-content:center; padding:0; " onclick="exec('motion', 'smartStagger', {frames: document.getElementById('macro-stagger-frames').value})">Stagger Layers</button>
                    </div>
                    <div class="grid-2">
                        <button class="btn" style="justify-content:center; padding:0; " onclick="exec('motion', 'smartTrim')">Trim to Keys</button>
                        <button class="btn" style="justify-content:center; padding:0; " onclick="exec('motion', 'autoPrecompCrop')">Crop Precomp</button>
                    </div>
                </div>
                <div class="card" id="card-keysmacro">
                    <div class="section-label">Keys Macro</div>
                    <button class="btn" style="width:100%; justify-content:center; padding:0; " onclick="exec('motion', 'reverseKeys')">Time-Reverse Keyframes</button>
                </div>
                <div class="card" id="card-keyframetransform">
                    <div class="section-label">Keyframe Transform</div>
                    <div class="grid-2" style="margin-bottom:8px;">
                        <button class="btn" onclick="exec('motion','mirrorKeys')"><span class="material-symbols-rounded">flip</span> Mirror</button>
                        <button class="btn" onclick="exec('motion','reverseKeys')"><span class="material-symbols-rounded">swap_vert</span> Reverse</button>
                        <button class="btn" onclick="exec('motion','cloneKeys')"><span class="material-symbols-rounded">copy_all</span> Clone</button>
                        <button class="btn" onclick="exec('motion','randomizeKeys', {maxOffset: document.getElementById('kfa-rnd').value})"><span class="material-symbols-rounded">casino</span> Random</button>
                    </div>
                    <div class="setting-row">
                        <span style="font-size:11px; color:var(--text-secondary);">Random max offset</span>
                        <input type="number" id="kfa-rnd" value="3" style="width: 40px; text-align:center; font-size:10px; background:var(--bg-app); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary);">
                    </div>
                </div>
                <div class="card" id="card-shiftalignkeys">
                    <div class="section-label">Shift & Align Keys</div>
                    <div class="setting-row" style="margin-bottom:8px;">
                        <span style="font-size:11px; color:var(--text-secondary);">Shift Frames</span>
                        <input type="number" id="kfa-shift" value="2" style="width: 40px; text-align:center; font-size:10px; background:var(--bg-app); border:1px solid var(--border-strong); border-radius:4px; color:var(--text-primary);">
                    </div>
                    <div class="grid-2" style="margin-bottom:8px;">
                        <button class="btn" onclick="exec('motion','shiftKeys',{frames: document.getElementById('kfa-shift').value})"><span class="material-symbols-rounded">chevron_right</span> Shift +</button>
                        <button class="btn" onclick="exec('motion','shiftKeys',{frames: -document.getElementById('kfa-shift').value})"><span class="material-symbols-rounded">chevron_left</span> Shift −</button>
                    </div>
                    <div class="grid-2">
                        <button class="btn" onclick="exec('motion','alignKeys',{alignTo:'first'})"><span class="material-symbols-rounded">align_horizontal_left</span> Align First</button>
                        <button class="btn" onclick="exec('motion','alignKeys',{alignTo:'last'})"><span class="material-symbols-rounded">align_horizontal_right</span> Align Last</button>
                    </div>
                </div>
            </div>

            <!-- DESIGN -->
            <div id="mod-design" class="module-container">
                <div class="module-header"><span class="material-symbols-rounded">match_case</span> Design</div>
                <div class="card" id="card-textanimations">
                    <div class="section-label">Text Animations</div>
                    <div class="grid-2">
                    <button class="btn" onclick="exec('creative', 'animateText', {type: 'typewriter'})">Typewriter</button>
                    <button class="btn" onclick="exec('creative', 'animateText', {type: 'scramble'})">Scramble</button>
                    <button class="btn" onclick="exec('creative', 'animateText', {type: 'fadeUp'})">Fade Up</button>
                    <button class="btn" onclick="exec('creative', 'animateText', {type: 'slideIn'})">Slide In</button>
                    </div>
                </div>
                <div class="card" id="card-autotextbox">
                    <div class="section-label">Auto Text Box</div>
                    <p style="font-size:11px; color:var(--text-secondary); margin-top:0; margin-bottom:12px;">Create dynamic shape layers that perfectly frame your text layers.</p>
                    <button class="btn btn-primary" style="width:100%; margin-bottom:8px;" onclick="exec('creative', 'autoTextBox')"><span class="material-symbols-rounded">check_box_outline_blank</span> Auto Text Box</button>
                </div>
                <div class="card" id="card-splittext">
                    <div class="section-label">Split Text</div>
                    <p style="font-size:11px; color:var(--text-secondary); margin-top:0; margin-bottom:12px;">Fragment a text layer into separate layer elements.</p>
                    <div class="grid-2">
                        <button class="btn" onclick="exec('creative', 'splitText', {mode: 'words'})">Split to Words</button>
                        <button class="btn" onclick="exec('creative', 'splitText', {mode: 'chars'})">Split to Chars</button>
                    </div>
                </div>
                <div class="card" id="card-autocolorcoderprism">
                    <div class="section-label">Auto Color Coder (Prism)</div>
                    <p style="font-size:11px; color:var(--text-secondary); margin-top:0; margin-bottom:12px;">Automatically color-code layers based on keywords in their names.</p>
                    <button class="btn btn-primary" style="width:100%;" onclick="exec('pipeline', 'autoLabelLayers')"><span class="material-symbols-rounded">palette</span> Auto Label Layers</button>
                </div>
            </div>

            
            <div id="mod-output" class="module-container">
                <div class="module-header"><span class="material-symbols-rounded">movie</span> Render Engine</div>

                <!-- FFMPEG SETUP CARD -->
                <div class="card" id="card-ffmpeg-setup" style="display:none; background: linear-gradient(135deg, rgba(88, 101, 242, 0.15) 0%, rgba(30, 31, 34, 0.05) 100%); border: 1px solid var(--accent-primary); position: relative; overflow: hidden; margin-bottom: 12px;">
                    <div class="section-label" style="color:var(--accent-primary); display:flex; align-items:center; gap:6px;"><span class="material-symbols-rounded" style="font-size:16px;">bolt</span> Render Engine Optimizer</div>
                    <p style="font-size:11px; color:var(--text-secondary); line-height:1.4; margin-top:6px; margin-bottom:12px;">
                        Motionreis uses a decoupled multi-threaded parallel engine to boost rendering speeds by up to 5x. Click below to automatically install and configure FFmpeg in the background.
                    </p>
                    <button id="ffmpeg-install-btn" class="btn btn-primary" style="width:100%; justify-content:center; padding:10px; font-weight:bold; font-size:12px;" onclick="runFFmpegAutoInstall()">
                        <span class="material-symbols-rounded" style="margin-right:6px; font-size:16px;">download</span> ⚡ START AUTO-INSTALL
                    </button>
                    <div id="ffmpeg-setup-status" style="display:none; font-size:10px; color:var(--text-secondary); margin-top:10px; font-family:monospace;">Ready...</div>
                    <div id="ffmpeg-setup-progress-bg" style="display:none; width:100%; height:4px; background:var(--bg-app); border-radius:2px; overflow:hidden; margin-top:4px;">
                        <div id="ffmpeg-setup-progress-bar" style="width:0%; height:100%; background:var(--accent-primary); transition:width 0.2s;"></div>
                    </div>
                </div>

                <!-- ── RENDER MODE PILL SWITCHER ── -->
                <div style="display:flex; gap:4px; background:var(--bg-app); border:1px solid var(--border-strong); border-radius:8px; padding:3px; margin-bottom:12px;">
                    <button id="pill-cli" onclick="switchRenderMode('cli')" style="flex:1; padding:6px 0; font-size:11px; font-weight:600; border:none; border-radius:6px; cursor:pointer; transition:all 0.2s; background:var(--accent-primary); color:#fff;">
                        ⚡ CLI Render
                    </button>
                    <button id="pill-queue" onclick="switchRenderMode('queue')" style="flex:1; padding:6px 0; font-size:11px; font-weight:600; border:none; border-radius:6px; cursor:pointer; transition:all 0.2s; background:transparent; color:var(--text-secondary);">
                        📋 Render Queue
                    </button>
                </div>

                <!-- ══════════════════════════════════════════════ -->
                <!-- PANEL A: CLI RENDER                            -->
                <!-- ══════════════════════════════════════════════ -->
                <div id="render-panel-cli">

                    <!-- 1. TARGET & FORMAT -->
                    <div class="card" id="card-output-format">
                        <div class="section-label">Target &amp; Format</div>
                        
                        <div class="setting-row" style="background:var(--bg-app); border-radius:4px; padding:6px 8px; margin-bottom:8px;">
                            <span style="font-size:10px; color:var(--text-secondary); flex:1;">Active Comp:</span>
                            <span id="active-comp-name" style="font-weight:bold; font-size:11px; color:var(--accent-primary); margin-right:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:right;">[Auto-Detecting...]</span>
                            <button id="pin-comp-btn" class="btn" style="padding:2px; background:transparent; border:none; color:var(--text-secondary);" onclick="togglePinComp()" title="Pin this Comp for rendering">
                                <span class="material-symbols-rounded" style="font-size:14px;">push_pin</span>
                            </button>
                        </div>

                        <div style="margin-bottom:12px;">
                            <span style="font-size:10px; color:var(--text-secondary); display:block; margin-bottom:6px;">Render</span>
                            <input type="text" id="render-output-name" placeholder="Waiting for comp..." class="theme-input" style="width:100%; padding:6px; font-size:11px; border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-panel); color:var(--text-primary); outline:none; transition:0.2s;" onfocus="this.style.borderColor='var(--accent-primary)'" onblur="this.style.borderColor='var(--border-strong)'">
                        </div>

                        <div class="grid-2" style="margin-bottom:12px;">
                            <div>
                                <span style="font-size:10px; color:var(--text-secondary); display:block; margin-bottom:6px;">Render Preset</span>
                                <select id="render-settings-select" class="theme-select" style="width:100%; padding:6px; font-size:11px; border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-panel); color:var(--text-primary); cursor:pointer;" onchange="
                                    var codec = document.getElementById('render-codec-select');
                                    if(this.value === 'Best Settings') codec.value = 'ProRes 422';
                                    else if(this.value === 'Draft Settings') codec.value = 'H.264';
                                    else if(this.value === 'DV Settings') codec.value = 'Lossless';
                                ">
                                    <option value="Best Settings">Best Settings (Full Res)</option>
                                    <option value="Draft Settings">Draft Settings (Half Res)</option>
                                    <option value="DV Settings">DV Settings</option>
                                    <option value="custom">Custom...</option>
                                </select>
                            </div>
                            <div>
                                <span style="font-size:10px; color:var(--text-secondary); display:block; margin-bottom:6px;">Render Codec</span>
                                <select id="render-codec-select" class="theme-select" style="width:100%; padding:6px; font-size:11px; border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-panel); color:var(--text-primary); cursor:pointer;" onchange="
                                    document.getElementById('render-settings-select').value = 'custom';
                                ">
                                    <optgroup label="Web &amp; Social">
                                        <option value="H.264">H.264 (MP4)</option>
                                        <option value="High Quality">High Quality</option>
                                        <option value="Animated GIF">Animated GIF</option>
                                    </optgroup>
                                    <optgroup label="Professional &amp; Master">
                                        <option value="ProRes 422">ProRes 422</option>
                                        <option value="ProRes 4444">ProRes 4444 (with Alpha)</option>
                                        <option value="Lossless">Lossless</option>
                                        <option value="Lossless with Alpha">Lossless with Alpha</option>
                                    </optgroup>
                                    <optgroup label="Image Sequences">
                                        <option value="PNG Sequence">PNG Sequence</option>
                                        <option value="JPEG Sequence">JPEG Sequence</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        <div style="margin-bottom:8px;">
                            <span style="font-size:10px; color:var(--text-secondary); display:block; margin-bottom:6px;">Time Range</span>
                            <div class="grid-2" id="time-range-group">
                                <label class="segmented-control active"><input type="radio" name="render_range" value="workarea" checked style="display:none;"> Work Area</label>
                                <label class="segmented-control"><input type="radio" name="render_range" value="fullcomp" style="display:none;"> Entire Comp</label>
                            </div>
                        </div>
                    </div>

                    <!-- 2. AUTOMATION & PATH -->
                    <div class="card" id="card-output-auto">
                        <div class="section-label">Automation &amp; Path</div>
                        
                        <div style="margin-bottom:12px;">
                            <span style="font-size:10px; color:var(--text-secondary); display:block; margin-bottom:6px;">Destination</span>
                            <div style="display:flex; gap:6px;">
                                <input type="text" id="render-path" value="[Same as Project Folder]" readonly style="flex:1; padding:6px 8px; font-size:10px; border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-app); color:var(--text-secondary);">
                                <button class="btn" style="padding:6px; justify-content:center;" onclick="selectRenderFolder()" title="Browse Folder"><span class="material-symbols-rounded" style="font-size:14px;">folder_open</span></button>
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <label style="font-size:11px; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="render-save-next" checked> Save next to AEP</label>
                            <label style="font-size:11px; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="render-auto-version" checked> Auto-Versioning (append _v01)</label>
                            <label style="font-size:11px; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="render-auto-save" checked> Auto-Save Project before Render</label>
                        </div>
                    </div>

                    <!-- 3. CLI ENGINE -->
                    <div class="card" id="card-clirender">
                        <div class="section-label">CLI Engine (aerender)</div>
                        
                        <div style="margin-bottom:12px;">
                            <span style="font-size:10px; color:var(--text-secondary); display:block; margin-bottom:6px;">Performance Throttle</span>
                            <select id="render-throttle" class="theme-select" style="width:100%; padding:6px; font-size:11px; border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-panel); color:var(--text-primary); cursor:pointer;">
                                <option value="balanced">🟡 Balanced (Standard Allocation)</option>
                                <option value="slow">🟢 Slow &amp; Silent (Leave CPU for Editing)</option>
                                <option value="max">🔴 MAX POWER (100% CPU &amp; RAM)</option>
                            </select>
                        </div>

                        <div style="margin-bottom:16px;">
                            <span style="font-size:10px; color:var(--text-secondary); display:block; margin-bottom:6px;">Post-Render Action</span>
                            <select id="render-postaction" class="theme-select" style="width:100%; padding:6px; font-size:11px; border:1px solid var(--border-strong); border-radius:4px; background:var(--bg-panel); color:var(--text-primary); cursor:pointer;">
                                <option value="chime">🔔 Play Chime</option>
                                <option value="explorer">📂 Show in Explorer/Finder</option>
                                <option value="sleep">🌙 Auto-Sleep Computer</option>
                                <option value="none">Do Nothing</option>
                            </select>
                        </div>

                        <button class="btn btn-primary" style="width:100%; justify-content:center; padding:10px; font-weight:bold; font-size:12px; border:1px solid var(--accent-primary); background:rgba(var(--accent-primary-rgb), 0.1); color:var(--text-primary);" onclick="startRenderV2()">
                            <span class="material-symbols-rounded" style="color:var(--accent-primary); margin-right:6px;">rocket_launch</span> START CLI RENDER
                        </button>
                        
                        <!-- Progress Bar -->
                        <div id="aerender-status" style="display:none; font-size:10px; color:var(--text-secondary); margin-top:12px; font-family:monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Rendering...</div>
                        <div id="aerender-progress-bg" style="display:none; width:100%; height:4px; background:var(--bg-app); border-radius:2px; overflow:hidden; margin-top:4px;">
                            <div id="aerender-progress-bar" style="width:0%; height:100%; background:var(--accent-primary); transition:width 0.2s;"></div>
                        </div>
                        
                        <!-- Recent File -->
                        <div id="aerender-recent-file" style="display:none; margin-top:8px;">
                            <button class="btn" style="width:100%; justify-content:center; padding:6px; font-size:10px; border:1px solid var(--border-strong); background:var(--bg-app); color:var(--text-primary);" onclick="openRecentRender()">
                                <span class="material-symbols-rounded" style="font-size:14px; margin-right:4px;">folder_open</span> Open Rendered File
                            </button>
                        </div>
                    </div>

                </div><!-- /render-panel-cli -->

                <!-- ══════════════════════════════════════════════ -->
                <!-- PANEL B: RENDER QUEUE                         -->
                <!-- ══════════════════════════════════════════════ -->
                <div id="render-panel-queue" style="display:none;">

                    <!-- Action bar -->
                    <div style="display:flex; gap:6px; margin-bottom:10px;">
                        <button class="btn btn-primary" style="flex:1; justify-content:center; padding:8px; font-size:11px; font-weight:700;" onclick="rqRenderAll()">
                            <span class="material-symbols-rounded" style="font-size:15px; margin-right:4px;">play_arrow</span> Render All
                        </button>
                        <button class="btn" style="flex:1; justify-content:center; padding:8px; font-size:11px;" onclick="rqAddActiveComp()">
                            <span class="material-symbols-rounded" style="font-size:15px; margin-right:4px;">add</span> Add Active Comp
                        </button>
                        <button class="btn" style="padding:8px; justify-content:center;" onclick="rqRefresh()" title="Refresh Queue">
                            <span class="material-symbols-rounded" style="font-size:15px;">refresh</span>
                        </button>
                    </div>

                    <!-- Queue Items List -->
                    <div id="rq-items-list" style="display:flex; flex-direction:column; gap:6px; min-height:80px;">
                        <div id="rq-empty-state" style="text-align:center; padding:24px 12px; color:var(--text-secondary); font-size:11px;">
                            <span class="material-symbols-rounded" style="font-size:32px; display:block; margin-bottom:8px; opacity:0.3;">queue</span>
                            Render Queue is empty.<br>Click "Add Active Comp" to add a composition.
                        </div>
                    </div>

                </div><!-- /render-panel-queue -->

            </div><!-- /mod-output -->


            <!-- BACKUP & SYNC SUITE (NOW PROJECT) -->
            <div id="mod-backup" class="module-container">
                <div class="module-header"><span class="material-symbols-rounded">folder_managed</span> Project Management</div>
                
                <div class="card" id="card-organizer">
                    <div class="section-label">Master Organizer</div>
                    <p style="font-size:11px; color:var(--text-secondary); margin-top:0; margin-bottom:12px;">Auto-sort your chaotic files into the standard structured folders based on extensions (.psd, .mp4, etc).</p>
                    
                    <button class="btn btn-primary" style="width:100%; margin-bottom:8px; justify-content:center;" onclick="promptOsOrganizeProject()">
                        <span class="material-symbols-rounded">folder_managed</span> Organize Finder (OS)
                    </button>
                    <button class="btn" style="width:100%; justify-content:center;" onclick="triggerAeOrganize()">
                        <span class="material-symbols-rounded">account_tree</span> Organize Project (AE)
                    </button>
                    
                    <div style="margin-top:8px; padding:8px 10px; background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:6px; display:flex; gap:8px; align-items:flex-start;">
                        <span class="material-symbols-rounded" style="font-size:14px; color:var(--accent-primary); margin-top:2px;">info</span>
                        <div style="font-size:10px; color:var(--text-secondary); line-height:1.4;">
                            <span style="color:var(--text-primary); font-weight:600;">Safe Folders:</span> Tambahkan tanda strip <b>(-)</b> di awal nama folder (contoh: <code>-Client Asset</code>) atau gunakan kata <b>export</b> (contoh: <code>03_EXPORT</code>). Folder tersebut beserta isinya tidak akan diganggu oleh Organizer.
                        </div>
                    </div>
                    
                    <div id="undo-ae-container" style="display:none; width:100%; margin-top:8px; gap:4px;">
                        <button class="btn" id="undo-ae-btn" style="flex:1; justify-content:center; opacity:0.8; font-size:10px; background:var(--bg-hover); color:var(--text-primary); border:1px solid var(--border-subtle);" onclick="undoLastAction()">
                            <span class="material-symbols-rounded" style="font-size:12px;">undo</span> Redo Last (20s)
                        </button>
                        <button class="btn" style="padding:4px; opacity:0.6; justify-content:center;" onclick="closeUndoAe()">
                            <span class="material-symbols-rounded" style="font-size:14px;">close</span>
                        </button>
                    </div>
                </div>

                <div class="card" id="card-smartrelinker">
                    <div class="section-label">Smart Relinker <span style="font-size:8px; background:var(--accent-primary); padding:2px 6px; border-radius:10px; margin-left:6px; color:white;">NEW</span></div>
                    <p style="font-size:11px; color:var(--text-secondary); margin-top:0; margin-bottom:12px;">Auto-find and relink offline assets.</p>
                    <button class="btn btn-primary" style="width:100%; justify-content:center;" onclick="triggerSmartRelinker()"><span class="material-symbols-rounded">link</span> Find & Relink Assets</button>
                </div>

                <div class="card" id="card-effectscanner">
                    <div class="section-label">Effect Finder & Scanner</div>
                    <div style="font-size:10px; color:var(--text-secondary); line-height:1.4; margin-bottom:12px;">
                        Fitur ini berguna untuk melacak efek apa saja yang dipakai di dalam project. Sangat berguna ketika Anda menghadapi error/bug efek dan ingin mencari tahu comp mana yang menjadi penyebabnya.
                    </div>
                    
                    <div style="display:flex; gap:6px; margin-bottom:8px;">
                        <input type="text" id="effect-search-input" placeholder="Nama efek (e.g. Drop Shadow)..." style="flex:1; background:var(--bg-hover); color:var(--text-primary); border:1px solid var(--border-strong); border-radius:4px; padding:6px 8px; font-size:11px; outline:none;" onkeypress="if(event.key === 'Enter') scanProjectEffects()">
                        <button class="btn btn-primary" style="padding:0 12px; height:auto;" onclick="scanProjectEffects()">
                            <span class="material-symbols-rounded" style="font-size:14px; margin-right:4px;">search</span> Scan
                        </button>
                    </div>
                    
                    <div id="effect-scan-results" style="display:flex; flex-direction:column; gap:6px; max-height:250px; overflow-y:auto; padding-right:4px; transition:all 0.3s ease;">
                        <!-- Results will populate here -->
                    </div>
                </div>

                <!-- Local Data Folder -->
                <div class="card" id="card-data-location">
                    <div class="section-label">Local Data Folder</div>
                    <div style="font-size:9px; color:var(--text-secondary); line-height:1.3; margin-bottom:8px;">Lokasi utama penyimpanan data plugin. Gunakan drive lokal/SSD untuk performa terbaik (Jangan gunakan folder cloud di sini).</div>
                    <div id="data-location-display-backup" style="font-family:monospace; font-size:9px; color:var(--text-secondary); background:var(--bg-hover); padding:6px; border-radius:4px; margin-bottom:8px; word-break:break-all;"></div>
                    <button class="btn" style="width:100%; justify-content:center;" onclick="promptMoveDataFolder()">
                        <span class="material-symbols-rounded">drive_file_move</span> Move Local Folder
                    </button>
                </div>

                <!-- Cloud Auto-Sync -->
                <div class="card">
                    <div class="section-label">Cloud Auto-Sync</div>
                    <p style="font-size:9px; color:var(--text-secondary); margin-top:0; margin-bottom:12px; line-height:1.3;">Pilih folder cloud (Google Drive, Dropbox). Data lokal akan otomatis disinkronkan ke sini. Di PC baru, folder ini akan menarik data ke Local Folder.</p>
                    
                    <div class="setting-row" style="margin-bottom:6px;">
                        <span style="font-size:11px; font-weight:600; color:var(--text-primary);">Sync Status</span>
                        <button id="toggle-cloud-sync-btn" class="toggle-btn" onclick="toggleCloudSync()">OFF</button>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <input type="text" id="cloud-sync-path" placeholder="Not configured (Click folder to choose...)" readonly style="flex:1; font-family:monospace; font-size:9px; background:var(--bg-hover); color:var(--text-muted); border:1px solid var(--border-strong); border-radius:4px; padding:6px; outline:none;">
                        <button class="btn" style="padding:6px 10px;" onclick="browseCloudSyncLocation()" title="Set Cloud Sync Folder"><span class="material-symbols-rounded" style="font-size:14px;">cloud_sync</span></button>
                    </div>
                    <div style="margin-top:8px;">
                        <button class="btn" style="width:100%; justify-content:center;" onclick="forcePushToCloud()">
                            <span class="material-symbols-rounded" style="font-size:14px;">cloud_upload</span> Force Push Local to Cloud
                        </button>
                    </div>
                </div>

                <!-- Auto-Sync Items -->
                <div class="card">
                    <div class="section-label">Auto-Sync Items</div>
                    <p style="font-size:9px; color:var(--text-secondary); margin-top:0; margin-bottom:12px; line-height:1.3;">Pilih data apa saja yang ingin di-backup & disinkronkan secara otomatis (seperti Smart Panel Mode).</p>
                    
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        <!-- Toggle 1: Plugin Settings -->
                        <div class="setting-row" style="align-items:flex-start; margin-bottom:0;">
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <span style="font-size:11px; color:var(--text-primary); font-weight:500;">Plugin Settings</span>
                                <span style="font-size:9px; color:var(--text-secondary); line-height:1.3;">UI customization (theme, speed mode, dll).</span>
                            </div>
                            <button id="toggle-sync-pref-btn" class="toggle-btn on" onclick="toggleSyncItem('pref')" style="margin-top:2px;">ON</button>
                        </div>

                        <!-- Toggle 2: Plugin Data -->
                        <div class="setting-row" style="align-items:flex-start; margin-bottom:0;">
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <span style="font-size:11px; color:var(--text-primary); font-weight:500;">Plugin Data</span>
                                <span style="font-size:9px; color:var(--text-secondary); line-height:1.3;">Custom ease presets & expression templates.</span>
                            </div>
                            <button id="toggle-sync-data-btn" class="toggle-btn on" onclick="toggleSyncItem('data')" style="margin-top:2px;">ON</button>
                        </div>

                        <!-- Toggle 3: After Effects Settings -->
                        <div class="setting-row" style="align-items:flex-start; margin-bottom:0;">
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <span style="font-size:11px; color:var(--text-primary); font-weight:500;">After Effects Settings</span>
                                <span style="font-size:9px; color:var(--text-secondary); line-height:1.3;">Custom workspaces, AE Prefs (shortcuts), & User Presets.</span>
                            </div>
                            <button id="toggle-sync-ae-btn" class="toggle-btn on" onclick="toggleSyncItem('ae')" style="margin-top:2px;">ON</button>
                        </div>
                        <!-- Toggle 4: AEP Blueprint -->
                        <div class="setting-row" style="align-items:flex-start; margin-bottom:0;">
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <span style="font-size:11px; color:var(--text-primary); font-weight:500;">After Effect Project</span>
                                <span style="font-size:9px; color:var(--text-secondary); line-height:1.3;">Backup file .aep secara otomatis ke Cloud (tanpa footage, hanya struktur) setiap 5 menit.</span>
                            </div>
                            <button id="toggle-sync-aep-btn" class="toggle-btn" onclick="toggleSyncItem('aep')" style="margin-top:2px;">OFF</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="mod-loader" class="module-container">
                <div class="module-header"><span class="material-symbols-rounded">psychology</span> Intelligent Loader (AI)</div>
                <div class="card" id="feat-pr-api-config">
                    <div class="section-label" style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span class="material-symbols-rounded" style="font-size: 14px; color: var(--accent-primary);">hub</span>
                            <span style="font-weight:600; color:var(--text-primary);">Universal AI Platform</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <p style="font-size:11px; color:var(--text-secondary); margin-bottom:12px; line-height:1.4;">
                            Configure the AI engine that powers this plugin. Your choice will be securely saved.
                        </p>
                        
                        <div style="display:flex; justify-content:center; margin-bottom: 12px; border-radius: 6px; overflow:hidden; border: 1px solid var(--border-strong);">
                            <button id="btn-tier-free" class="btn" style="flex:1; border-radius:0; background:var(--accent-primary); color:#fff; font-size:10px; padding:6px; font-weight:600;" onclick="window.switchAITier('free')">FREE API TIER</button>
                            <button id="btn-tier-paid" class="btn" style="flex:1; border-radius:0; background:var(--bg-app); color:var(--text-secondary); font-size:10px; padding:6px; font-weight:600;" onclick="window.switchAITier('paid')">PAID API TIER</button>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap:10px; padding: 10px; border-radius: 6px; border: 1px solid var(--border-strong);">
                            
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">Provider</label>
                                <select id="ai-platform-select" class="input-text" style="width:100%; padding:6px 8px; font-size:11px; cursor:pointer;">
                                    <option value="gemini">Google Gemini</option>
                                    <option value="openai">OpenAI (ChatGPT)</option>
                                    <option value="anthropic">Anthropic (Claude)</option>
                                    <option value="deepseek">DeepSeek</option>
                                </select>
                            </div>

                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">API Key</label>
                                <div style="display:flex; gap:6px;">
                                    <input type="password" id="multi-api-key" class="input-text" placeholder="Paste API Key here..." style="flex:1; padding:6px 8px; font-size:11px; font-family:monospace;">
                                    <button id="btn-connect-ai" class="btn" style="background: var(--bg-hover); color: var(--text-primary); border: 1px solid var(--border-strong); padding: 0 12px; font-size: 11px;" onclick="connectAIPlatform()" title="Connect & Validate">
                                        <span class="material-symbols-rounded" style="font-size:14px;">sync</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">Active Model</label>
                                <select id="multi-model-select" class="input-text" style="width:100%; padding:6px 8px; font-size:11px; cursor:pointer; color:var(--accent-primary);" disabled>
                                    <option value="">Awaiting connection...</option>
                                </select>
                            </div>
                            
                        </div>
                        
                        <button id="btn-save-ai-config" class="btn" style="width: 100%; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 11px; font-weight: 500; transition: all 0.2s;" onclick="saveAIConfig()" disabled>
                            <span class="material-symbols-rounded" style="font-size:14px;">save</span> Save Setup
                        </button>

                        <div id="active-ai-config" style="margin-top: 12px; display: none;">
                            <div style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-hover); border: 1px solid var(--border-strong); padding: 8px 10px; border-radius: 6px;">
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <span style="font-size:9px; color:var(--text-secondary); text-transform:uppercase;">Active Setup</span>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <span id="active-ai-platform-icon" class="material-symbols-rounded" style="font-size:12px; color:var(--accent-primary);">hub</span>
                                        <span id="active-ai-text" style="font-size:11px; font-weight:500; color:var(--text-primary);">Google Gemini (gpt-4)</span>
                                    </div>
                                    <span id="active-ai-key-text" style="font-size:9px; font-family:monospace; color:var(--text-muted);">AQ.Ab8...</span>
                                </div>
                                <button class="btn" style="padding:4px; min-width:unset; font-size:11px;" onclick="clearAIConfig()" title="Clear Configuration">
                                    <span class="material-symbols-rounded" style="font-size:14px; pointer-events:none;">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card" id="feat-pr-intelligent-loader">
                    <div class="section-label" style="display:flex; justify-content:space-between; align-items:center;">
                        <span>Intelligent Loader</span>
                        <span class="material-symbols-rounded" style="font-size: 14px; opacity: 0.5;">psychology</span>
                    </div>
                    <div class="card-body">
                        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4; margin-top: 4px;">
                            Deep-scans folders and smartly organizes your footage into the <strong>active sequence</strong> using Gemini AI.
                        </p>

                        <div class="input-group" style="margin-top: 8px;">
                            <label style="display: flex; align-items: center; gap: 6px;">
                                <input type="checkbox" id="loader-add-markers" checked> 
                                Auto-create Timeline Markers
                            </label>
                        </div>
                        
                            <button id="btn-run-loader" class="btn btn-primary" style="width: 100%; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="runAiLoader()">
                                <span class="material-symbols-rounded">auto_awesome</span> Start AI Loader
                            </button>
                            
                            <div id="loader-status" style="margin-top: 10px; font-size: 10px; color: var(--text-muted); text-align: center; display: none;">
                                Ready...
                            </div>
                        </div>
                    </div>

                    <div class="card pr-only" id="feat-pr-master-organizer">
                        <div class="section-label" style="display:flex; justify-content:space-between; align-items:center;">
                            <span>Master Organizer</span>
                            <span class="material-symbols-rounded" style="font-size: 14px; opacity: 0.5;">folder_special</span>
                        </div>
                        <div class="card-body">
                            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4; margin-top: 4px;">
                                Automatically creates standard folder structures and organizes your project bins.
                            </p>
                            <button id="btn-run-pr-organizer" class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="exec('pipeline', 'prOrganizeProject')">
                                <span class="material-symbols-rounded">folder_special</span> Organize Project Bins
                            </button>
                        </div>
                    </div>
                </div>

                <!-- AI COMMAND PROMPT -->
                <div id="mod-chat" class="module-container pr-only">
                    <div class="module-header" style="display:flex; justify-content:space-between; align-items:center;">
                        <span><span class="material-symbols-rounded" style="vertical-align:bottom; margin-right:4px;">terminal</span> AI Command</span>
                    </div>
                    <div class="card">
                        <div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px; line-height:1.5;">
                            Ketik perintah buat dieksekusi otomatis sama AI. Jangan pake bahasa kaku, bahasa santai aja.
                        </div>
                        <input type="text" id="chat-input" class="form-control" style="width:100%; margin-bottom:12px; font-size:12px; padding:10px 14px; border-radius:6px;" placeholder="Contoh: Hapus klip yang didisable..." onkeydown="if(event.key==='Enter') window.sendChatMessage()">
                        <button id="btn-send-chat" class="btn btn-primary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:8px;" onclick="window.sendChatMessage()">
                            <span class="material-symbols-rounded">auto_awesome</span> Execute Command
                        </button>
                        <div id="command-status" style="position:relative; margin-top:12px; font-size:10px; color:var(--text-primary); text-align:left; display:none; font-family:monospace; background:var(--bg-hover); padding:10px 24px 10px 10px; border-radius:4px; line-height:1.4;">
                            <span id="command-status-text">Executing...</span>
                            <span class="material-symbols-rounded" style="position:absolute; top:8px; right:8px; font-size:14px; cursor:pointer; opacity:0.7;" onclick="document.getElementById('command-status').style.display='none'">close</span>
                        </div>
                    </div>
                </div>
                
                <!-- AI VIRAL CLIPPER -->
                <div id="mod-clipper" class="module-container pr-only">
                    <div class="module-header" style="display:flex; justify-content:space-between; align-items:center;">
                        <span><span class="material-symbols-rounded" style="vertical-align:bottom; margin-right:4px;">content_cut</span> AI Viral Clipper</span>
                    </div>
                    
                    <div class="card" id="clipper-setup-card">
                        <div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px; line-height:1.5;">
                            Fitur ini butuh <strong style="color:var(--accent-primary)">Whisper AI lokal</strong> buat transkripsi video lo tanpa biaya API. Pastiin Python 3 udah keinstall di Mac lo.
                        </div>
                        <button id="btn-setup-whisper" class="btn btn-secondary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:8px;" onclick="window.setupWhisper()">
                            <span class="material-symbols-rounded">download</span> Setup Local Whisper
                        </button>
                        <div id="whisper-setup-status" style="margin-top:12px; font-size:10px; color:var(--text-primary); text-align:left; display:none; font-family:monospace; background:var(--bg-hover); padding:10px; border-radius:4px; line-height:1.4;">
                            Menyiapkan environment...
                        </div>
                    </div>

                    <div class="card" id="clipper-ready-card" style="display:none;">
                        <div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px; line-height:1.5;">
                            Taruh video podcast/vlog mentahan di track V1. AI bakal baca file aslinya, nyari momen paling viral, dan otomatis potong jadi format vertikal 9:16.
                        </div>
                        <button id="btn-run-clipper" class="btn btn-primary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:8px;" onclick="window.runViralClipper()">
                            <span class="material-symbols-rounded">auto_awesome</span> Extract Viral Clip
                        </button>
                        <div id="clipper-status" style="margin-top:12px; font-size:10px; color:var(--accent-primary); text-align:center; display:none; font-weight: 500;">
                            Ready...
                        </div>
                    </div>
                </div>

            <div id="mod-info" class="module-container">
                <div class="module-header"><span class="material-symbols-rounded">info</span> Info & Help</div>
                
                <div class="card" style="text-align:center; padding:24px 16px; background:linear-gradient(135deg, rgba(88, 101, 242, 0.1) 0%, rgba(30, 31, 34, 0) 100%); border:1px solid var(--border-strong); position:relative; overflow:hidden;">
                    <span class="material-symbols-rounded" style="position:absolute; font-size:120px; color:rgba(88, 101, 242, 0.05); top:-20px; right:-20px; transform:rotate(-15deg); pointer-events:none;">rocket_launch</span>
                    <div style="font-size:20px; font-weight:800; color:var(--text-primary); margin-bottom:2px; letter-spacing:0.5px;">MOTIONREIS</div>
                    <div style="font-size:10px; font-weight:600; color:var(--accent-primary); margin-bottom:12px; letter-spacing:2px; text-transform:uppercase;">Master Suite</div>
                    <p style="font-size:11px; color:var(--text-secondary); margin:0; line-height:1.5;">Your all-in-one assistant for After Effects.</p>
                </div>

                <!-- PREFERENCES -->
                <div class="card" id="card-settings">
                    <div class="section-label">Preferences</div>
                    
                    <div class="setting-row" style="align-items:flex-start;">
                        <span style="font-size:11px; color:var(--text-primary); margin-top:4px;">Theme Color</span>
                        <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:6px;">
                            <div class="color-swatch" style="background:#5c6ac4;" onclick="setThemeColor('#5c6ac4')" title="Indigo"></div>
                            <div class="color-swatch" style="background:#0891b2;" onclick="setThemeColor('#0891b2')" title="Cyan"></div>
                            <div class="color-swatch" style="background:#10b981;" onclick="setThemeColor('#10b981')" title="Emerald"></div>
                            <div class="color-swatch" style="background:#f59e0b;" onclick="setThemeColor('#f59e0b')" title="Amber"></div>
                            <div class="color-swatch" style="background:#ef4444;" onclick="setThemeColor('#ef4444')" title="Rose"></div>
                            
                            <div class="color-swatch" style="background:#9333ea;" onclick="setThemeColor('#9333ea')" title="Purple"></div>
                            <div class="color-swatch" style="background:#ec4899;" onclick="setThemeColor('#ec4899')" title="Pink"></div>
                            <div class="color-swatch" style="background:#3b82f6;" onclick="setThemeColor('#3b82f6')" title="Blue"></div>
                            <div class="color-swatch" style="background:#84cc16;" onclick="setThemeColor('#84cc16')" title="Lime"></div>
                            <div class="color-swatch" style="background:#f97316;" onclick="setThemeColor('#f97316')" title="Orange"></div>
                        </div>
                    </div>

                    <div class="setting-row" style="align-items:flex-start;">
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <span style="font-size:11px; color:var(--text-primary);">Speed Mode</span>
                            <span style="font-size:9px; color:var(--text-secondary); line-height:1.3;">Disables "Are you sure?" confirmation dialogs<br>for faster workflow (Pro users).</span>
                        </div>
                        <button id="toggle-speed-btn" class="toggle-btn" onclick="toggleSpeedMode()" style="margin-top:2px;">OFF</button>
                    </div>

                    <div class="setting-row" style="align-items:flex-start; margin-top:12px;">
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <span style="font-size:11px; color:var(--text-primary);">Smart Panel Mode</span>
                            <span style="font-size:9px; color:var(--text-secondary); line-height:1.3;">Highlights your most frequently used feature buttons<br>based on click metrics saved in Documents.</span>
                        </div>
                        <button id="toggle-smart-btn" class="toggle-btn" onclick="toggleSmartMode()" style="margin-top:2px;">OFF</button>
                    </div>

                    <div class="setting-row" style="align-items:flex-start; margin-top:12px;">
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <span style="font-size:11px; color:var(--text-primary);">Include Icon in Theme</span>
                            <span style="font-size:9px; color:var(--text-secondary); line-height:1.3;">Overrides cohesive card icon colors with the active theme color.</span>
                        </div>
                        <button id="toggle-theme-icons-btn" class="toggle-btn" onclick="toggleThemeIcons()" style="margin-top:2px;">OFF</button>
                    </div>

                    
                    <div class="grid-2" style="margin-top:16px;">
                        <button class="btn" style="justify-content:center; color:var(--text-primary);" onclick="resetPreferences()" title="Reset all UI and behavior settings">Reset Settings</button>
                        <button class="btn" style="justify-content:center; color:var(--accent-danger); border-color:var(--border-strong);" onclick="factoryReset()" title="Delete everything, including Ease Library">Factory Reset</button>
                    </div>
                </div>

                <div class="card">
                    <div class="section-label" style="color:var(--accent-primary); font-size:12px; margin-bottom:12px;">What does everything do?</div>
                    
                    <div style="font-size:11px; color:var(--text-secondary); line-height:1.6;">
                        
                        <div style="margin-bottom:12px;"><b style="color:var(--accent-cyan); font-size:12px;">GENERAL & RIGGING</b></div>
                        <b style="color:var(--text-primary);">Master Organizer:</b> Cleans up your messy project! The (OS) button organizes all the actual files (videos, images) on your computer's hard drive into neat folders. The (AE) button does the same thing, but for the folders inside your After Effects project window.<br><br>
                        <b style="color:var(--text-primary);">Anchor Point:</b> The anchor point is the center dot that your layer spins or grows from. Click any dot on the 3x3 grid to instantly snap that center dot to any corner or exactly in the middle of your layer.<br><br>
                        <b style="color:var(--text-primary);">Motion Tools (Null):</b> Creates an invisible helper box (called a Null) exactly in the dead center of all the layers you selected. You can then move or scale this one Null to control everything at once.<br><br>
                        <b style="color:var(--text-primary);">Motion Tools (Sequence):</b> Arranges your selected layers like a staircase in the timeline, so they appear on screen one after another instead of all popping up at the exact same time.<br><br>
                        <b style="color:var(--text-primary);">Motion Tools (Keys):</b> "Clone" makes a perfect duplicate of your selected keyframes. "Paste Keys" lets you paste keyframes exactly where your blue timeline needle (playhead) is.<br><br>
                        <b style="color:var(--text-primary);">Path Rigging:</b> "Pts &rarr; Null" takes the points of a shape and turns them into Nulls so you can animate each point easily. "Null &rarr; Pts" does the reverse (makes a shape follow Nulls). "Trace" makes a layer stick to a path and follow it like a train on tracks.<br><br>

                        <div style="margin-bottom:12px; margin-top:16px;"><b style="color:var(--accent-cyan); font-size:12px;">KINETICS (ANIMATION)</b></div>
                        <b style="color:var(--text-primary);">Keyframe Wingman:</b> Makes your animations look professional and smooth! Select your keyframes and move the "Out" and "In" sliders to change how fast or slow the movement starts and ends. You can also just click the quick presets like "STR" (Strong smooth) or "MAX" (Maximum smooth).<br><br>
                        <b style="color:var(--text-primary);">Copy / Paste Ease:</b> Copies the exact speed, smoothness, and graph shape from one animation, and pastes it perfectly onto a completely different animation.<br><br>
                        <b style="color:var(--text-primary);">My Ease Library:</b> Built a really cool animation graph? Type a name and click save! It will be saved here forever as a preset button, so you can reuse that exact smoothness anytime without guessing the numbers.<br><br>
                        <b style="color:var(--text-primary);">Expression Engine:</b> Magically writes complex animation code for you! Select a property (like rotation) and choose "Loop" to make it spin forever, or "Pingpong" to make it swing back and forth automatically.<br><br>

                        <div style="margin-bottom:12px; margin-top:16px;"><b style="color:var(--accent-cyan); font-size:12px;">DESIGN & SCENE</b></div>
                        <b style="color:var(--text-primary);">Responsive Design:</b> Ever wanted a colored box behind your text that automatically changes size when you type longer or shorter words? Just click this, and it builds that smart auto-resizing box for you.<br><br>
                        <b style="color:var(--text-primary);">Shape to Comp:</b> Takes a normal shape layer and converts it into its very own composition, perfectly cropped to fit the shape's exact size.<br><br>
                        <b style="color:var(--text-primary);">Auto Crop:</b> Automatically scans your composition, finds all the empty useless transparent space around your graphics, and crops the composition to fit perfectly tight around your art.<br><br>
                        <b style="color:var(--text-primary);">Trim Comp:</b> Trims the total time of your composition so it starts and ends exactly where your layers start and end. No more empty black video at the end!<br><br>
                        <b style="color:var(--text-primary);">Precomp & Un-Precomp:</b> "Precomp" packs your selected layers into a new composition (like putting them in a folder). "Un-precomp" magically extracts layers out of a precomp back into your main timeline.<br><br>

                        <div style="margin-bottom:12px; margin-top:16px;"><b style="color:var(--accent-cyan); font-size:12px;">LAYERS & MACRO</b></div>
                        <b style="color:var(--text-primary);">Smart Layers:</b> Instantly rename 50 layers at once. You can also click the quick buttons to Solo (hide everything else), Shy (hide from timeline), Lock, or turn on/off all your selected layers with one click.<br><br>
                        <b style="color:var(--text-primary);">Transition Shifter:</b> Push a bunch of layers forward or backward in time easily. You can push them by exactly 5 frames, or even shuffle them randomly for a chaotic glitch effect!<br><br>
                        <b style="color:var(--text-primary);">Keyframe Macro:</b> "Reverse" flips your animation so it plays backwards. "Mirror" creates a mirrored copy of your animation. "Align" snaps all your messy keyframes into one neat line.<br><br>
                        <b style="color:var(--text-primary);">Layer Macro:</b> "Sort" arranges your messy layers neatly alphabetically by name. "Reverse Layers" flips the order of your layers completely upside down in the timeline stack.<br><br>
                        <b style="color:var(--text-primary);">Color Palettes:</b> Save your brand's specific colors here. Just click a color box to instantly apply it to whatever text or shape you have selected. No more copy-pasting hex codes!<br><br>

                        <div style="margin-bottom:12px; margin-top:16px;"><b style="color:var(--accent-cyan); font-size:12px;">RENDER & EXTRAS</b></div>
                        <b style="color:var(--text-primary);">Render Engine:</b> Configure your render settings, codec, and file name directly inside the panel, then send it straight to the Render Queue without opening clunky menus.<br><br>
                        <b style="color:var(--text-primary);">VFX Data Bridge:</b> Export your tracking data, camera moves, or animation numbers so you can send it out to other software, plugins, or your team.<br><br>
                        <b style="color:var(--text-primary);">Media Encoder:</b> Sends your current composition straight to Adobe Media Encoder with a single click, ready to be rendered into an MP4 video.<br><br>
                    </div>
                </div>

                <!-- CREDIT -->
                <div class="card" style="text-align:center; padding:24px 16px;">
                    <div style="font-size:12px; font-weight:600; color:var(--text-primary); margin-bottom:8px;">Motionreis Suite</div>
                    <div style="font-size:10px; color:var(--text-secondary); line-height:1.5;">
                        Developed by Sebastian.<br><br>
                        A powerhouse utility designed to accelerate your After Effects workflow, eliminating repetitive tasks so you can focus purely on motion design.
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- CUSTOMIZE MODAL -->
    <div id="customize-modal" class="modal">
        <div class="modal-content" style="max-width:280px;">
            <div class="modal-header">
                <h3>Customize Home</h3>
            </div>
            <div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">Select tools to pin to your Dashboard.</div>
            
            <div id="customize-list" style="display:flex; flex-direction:column; gap:8px; max-height:300px; overflow-y:auto; padding-right:8px; margin-bottom:16px;">
                <!-- Dynamically populated -->
            </div>
            
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1; justify-content:center;" onclick="closeCustomizeModal()">Cancel</button>
                <button class="btn btn-primary" style="flex:1; justify-content:center;" onclick="saveCustomizeModal()">Save</button>
            </div>
        </div>
    </div>

    
    <!-- CONFIRM MODAL -->
    <div id="confirm-modal" class="modal" style="z-index:3000;">
        <div class="modal-content" style="max-width:280px; text-align:center;">
            <div class="modal-header" style="justify-content:center; border-bottom:none; margin-bottom:0;">
                <h3 id="confirm-title" style="color:var(--text-primary); font-size:14px;">Confirm</h3>
            </div>
            <div id="confirm-desc" style="font-size:12px; color:var(--text-secondary); margin-bottom:20px;">Are you sure?</div>
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1; justify-content:center; background:var(--bg-hover);" onclick="closeConfirmModal()">Cancel</button>
                <button class="btn btn-primary" id="confirm-btn-yes" style="flex:1; justify-content:center; background:var(--accent-danger); border-color:var(--accent-danger);">Delete</button>
            </div>
        </div>
    </div>

    <!-- OS ORGANIZE WARNING MODAL -->
    <div id="os-org-modal" class="modal" style="z-index:3000;">
        <div class="modal-content" style="max-width:380px; text-align:center;">
            <div class="modal-header" style="justify-content:center; border-bottom:none; margin-bottom:0;">
                <h3 style="color:var(--accent-warning); font-size:18px; display:flex; align-items:center; gap:6px;"><span class="material-symbols-rounded" style="font-size:20px;">warning</span> Warning</h3>
            </div>
            <div style="font-size:13px; color:var(--text-secondary); margin-bottom:15px; line-height:1.5;">
                You are about to organize the following folder:<br>
                <div id="os-org-path-display" style="margin:10px 0; padding:8px 12px; background:var(--bg-hover); border-radius:4px; font-family:monospace; word-break:break-all; color:var(--text-primary); font-size:12px; border:1px solid var(--border-strong);"></div>
                Please ensure this is a project folder. Do NOT use this inside generic folders like Documents or Downloads!
            </div>
            
            <label id="os-org-dont-ask-container" style="display:none; align-items:center; justify-content:center; gap:8px; font-size:12px; color:var(--text-secondary); margin-bottom:15px; cursor:pointer;">
                <input type="checkbox" id="os-org-dont-ask" onchange="handleOsOrgCheckbox()">
                Don't ask me again
            </label>
            
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1; justify-content:center; background:var(--bg-hover);" onclick="closeOsOrgModal()">Cancel</button>
                <button class="btn btn-primary" id="os-org-btn-ok" style="flex:1; justify-content:center; background:var(--accent-primary); border-color:var(--accent-primary);" disabled onclick="confirmOsOrg()">OK (5s)</button>
            </div>
        </div>
    </div>
    
    <!-- SMART RELINK ORGANIZER MODAL -->
    <div id="smart-relink-org-modal" class="modal" style="z-index:3500;">
        <div class="modal-content" style="max-width:380px; text-align:center;">
            <div class="modal-header" style="justify-content:center; border-bottom:none; margin-bottom:0;">
                <h3 style="color:var(--accent-primary); font-size:16px; display:flex; align-items:center; gap:6px;"><span class="material-symbols-rounded">check_circle</span> Relink Successful!</h3>
            </div>
            <div style="font-size:12px; color:var(--text-secondary); margin-bottom:15px; line-height:1.4;">
                <span id="smart-relink-count" style="font-weight:bold; color:var(--text-primary);"></span> offline assets were successfully relinked.<br><br>
                However, these files are located outside your main Project Organizer folders. Do you want to sort and move/copy them into your project folder now?
            </div>
            
            <div style="display:flex; flex-direction:column; gap:8px;">
                <button class="btn btn-primary" style="justify-content:center;" onclick="organizeRelinkedAssets('copy')"><span class="material-symbols-rounded">content_copy</span> Copy to Project Folders</button>
                <button class="btn btn-primary" style="justify-content:center; background:var(--bg-hover); color:var(--text-primary); border-color:var(--border-strong);" onclick="organizeRelinkedAssets('move')"><span class="material-symbols-rounded">drive_file_move</span> Move to Project Folders</button>
                <button class="btn" style="justify-content:center; margin-top:4px;" onclick="closeSmartRelinkModal()">No, leave them there</button>
            </div>
        </div>
    </div>

    <!-- SYNC CONFLICT MODAL -->
    <div id="sync-conflict-modal" class="modal" style="z-index:2500;">
        <div class="modal-content" style="max-width:320px;">
            <div class="modal-header">
                <h3 style="color:var(--text-primary); font-size:14px; display:flex; align-items:center; gap:6px;">
                    <span class="material-symbols-rounded" style="color:var(--accent-warning);">sync_problem</span> Data Conflict
                </h3>
            </div>
            <div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px; line-height:1.4;">
                Motionreis data already exists in the target folder. How would you like to handle the conflict?
            </div>
            
            <div style="background:var(--bg-hover); padding:10px; border-radius:6px; margin-bottom:12px;">
                <div style="font-size:11px; color:var(--text-primary); margin-bottom:6px; font-weight:600;">Settings & Preferences</div>
                <label style="display:flex; align-items:center; gap:8px; font-size:10px; color:var(--text-secondary); margin-bottom:6px; cursor:pointer;">
                    <input type="radio" name="sync_settings" value="local" checked> Keep Local (Overwrite Target)
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:10px; color:var(--text-secondary); cursor:pointer;">
                    <input type="radio" name="sync_settings" value="target"> Use Target (Load Target Settings)
                </label>
            </div>
            
            <div style="background:var(--bg-hover); padding:10px; border-radius:6px; margin-bottom:16px;">
                <div style="font-size:11px; color:var(--text-primary); margin-bottom:6px; font-weight:600;">Saved Data (Ease Library, etc.)</div>
                <label style="display:flex; align-items:center; gap:8px; font-size:10px; color:var(--text-secondary); margin-bottom:6px; cursor:pointer;">
                    <input type="radio" name="sync_data" value="merge" checked> Merge (Combine Local & Target)
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:10px; color:var(--text-secondary); margin-bottom:6px; cursor:pointer;">
                    <input type="radio" name="sync_data" value="local"> Keep Local (Overwrite Target)
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:10px; color:var(--text-secondary); cursor:pointer;">
                    <input type="radio" name="sync_data" value="target"> Use Target (Load Target Data)
                </label>
            </div>
            
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1; justify-content:center; background:var(--bg-hover);" onclick="closeSyncConflictModal()">Cancel</button>
                <button class="btn btn-primary" style="flex:1; justify-content:center;" onclick="executeDataSync()">Proceed</button>
            </div>
        </div>
    </div>

    <!-- TEXT PROMPT MODAL -->
    <div id="text-prompt-modal" class="modal" style="z-index:2000;">
        <div class="modal-content" style="max-width:280px;">
            <div class="modal-header">
                <h3 id="prompt-title">Enter Name</h3>
            </div>
            <div id="prompt-desc" style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">Please enter a value:</div>
            
            <input type="text" id="prompt-input" style="width:100%; background:var(--bg-app); border:1px solid var(--border-strong); color:var(--text-primary); padding:8px; border-radius:4px; font-size:12px; margin-bottom:16px; outline:none; box-sizing:border-box;">
            
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1; justify-content:center;" onclick="closeTextPrompt()">Cancel</button>
                <button class="btn btn-primary" style="flex:1; justify-content:center;" onclick="submitTextPrompt()">Save</button>
            </div>
        </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div id="toast-container" style="position:fixed; bottom:-80px; left:0; width:100%; background:var(--accent-danger, #ef4444); color:#ffffff; padding:12px 16px; font-size:11px; font-weight:600; box-shadow:0 -4px 16px rgba(0,0,0,0.4); transition:bottom 0.3s cubic-bezier(0.2, 0, 0, 1), background 0.3s, opacity 0.3s; z-index:9999; display:flex; align-items:center; gap:8px; opacity:0;">
        <span class="material-symbols-rounded" style="font-size:16px; color:rgba(255,255,255,0.7); cursor:pointer;" onclick="closeToast()">close</span>
        <span id="toast-icon" class="material-symbols-rounded" style="font-size:16px; color:rgba(255,255,255,0.9);">error</span>
        <span id="toast-msg" style="flex:1; white-space:normal; line-height:1.4;">Error</span>
    </div>

    <script src="../../shared/csinterface.js"></script>
    <script src="../../shared/bridge.js"></script>
    <script>
        var fs = require('fs');
        var path = require('path');
        var os = require('os');
        // Data Path Architecture
        var POINTER_FILE = path.join(os.homedir(), 'Documents', 'Motionreis_Pointer.txt');
        
        var EASE_LIB_DIR = path.join(os.homedir(), 'Documents', 'Motionreis SUITE');
        
        try {
            if (fs.existsSync(POINTER_FILE)) {
                var p = fs.readFileSync(POINTER_FILE, 'utf8').trim();
                if (fs.existsSync(p)) {
                    if (!p.endsWith('Motionreis SUITE')) {
                        EASE_LIB_DIR = path.join(p, 'Motionreis SUITE');
                    } else {
                        EASE_LIB_DIR = p;
                    }
                }
            }
        } catch(e) { console.error("Error reading pointer:", e); }
        
        // Create dir early if it doesn't exist
        if (!fs.existsSync(EASE_LIB_DIR)) fs.mkdirSync(EASE_LIB_DIR, { recursive: true });

        var EASE_LIB_FILE = path.join(EASE_LIB_DIR, 'ease_presets.json');
        
        // ── NATIVE RECENT PROJECTS SYSTEM ───────────────────────────
        var RECENT_CACHE_FILE = path.join(EASE_LIB_DIR, 'recent_project_cache.json');
        var THEME_CONFIG_FILE = path.join(EASE_LIB_DIR, 'theme_config.json');
        var currentlyOpenProjectPath = null;
        var currentlyOpenProjectLastActive = null;
        
        // Helper to format timestamps to relative time (universal)
        function formatRelativeTime(isoString) {
            if (!isoString) return "";
            try {
                // ISO format: YYYY-MM-DDTHH:mm:ss
                var past = new Date(isoString);
                var now = new Date();
                var diffMs = now - past;
                if (isNaN(diffMs) || diffMs < 0) return "Just now";
                
                var diffSec = Math.floor(diffMs / 1000);
                var diffMin = Math.floor(diffSec / 60);
                var diffHr = Math.floor(diffMin / 60);
                var diffDays = Math.floor(diffHr / 24);
                
                if (diffSec < 60) return "Just now";
                if (diffMin < 60) return diffMin + "m ago";
                if (diffHr < 24) return diffHr + "h ago";
                if (diffDays === 1) return "Yesterday";
                if (diffDays < 7) return diffDays + " days ago";
                
                // Fallback to localized date
                return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            } catch (e) {
                return "";
            }
        }

        // Helper to parse AE timestamp formats (like 20260524T213943)
        function parseAETimestamp(ts) {
            if (!ts || ts.length < 15) return null;
            try {
                var y = ts.substring(0, 4);
                var m = ts.substring(4, 6);
                var d = ts.substring(6, 8);
                var h = ts.substring(9, 11);
                var min = ts.substring(11, 13);
                var s = ts.substring(13, 15);
                return `${y}-${m}-${d}T${h}:${min}:${s}`;
            } catch (e) {
                return null;
            }
        }

        // Dynamically find and parse the native After Effects Prefs file
        function getNativeRecentProjects() {
            try {
                // If variables are null, try to load from persistent JSON cache
                if (!currentlyOpenProjectPath && fs.existsSync(RECENT_CACHE_FILE)) {
                    try {
                        var cache = JSON.parse(fs.readFileSync(RECENT_CACHE_FILE, 'utf8'));
                        if (cache && cache.path) {
                            currentlyOpenProjectPath = cache.path;
                            currentlyOpenProjectLastActive = cache.lastActive;
                        }
                    } catch (e) {
                        console.error("[RecentProjects] Failed to read recent cache:", e);
                    }
                }

                var isWin = process.platform === 'win32';
                var aePrefsBaseDir = "";
                if (isWin) {
                    if (process.env.APPDATA) {
                        aePrefsBaseDir = path.join(process.env.APPDATA, 'Adobe', 'After Effects');
                    } else {
                        aePrefsBaseDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Adobe', 'After Effects');
                    }
                } else {
                    aePrefsBaseDir = path.join(os.homedir(), 'Library', 'Preferences', 'Adobe', 'After Effects');
                }

                if (!fs.existsSync(aePrefsBaseDir)) {
                    console.log("[RecentProjects] AE Prefs directory not found:", aePrefsBaseDir);
                    return [];
                }

                // Scan all folders (e.g. 26.2, 26.0) to find version directories
                var subdirs = fs.readdirSync(aePrefsBaseDir).filterfunction(name ) {
                    var fullPath = path.join(aePrefsBaseDir, name);
                    return fs.statSync(fullPath).isDirectory() && /^\d+(\.\d+)*$/.test(name);
                });

                if (subdirs.length === 0) {
                    console.log("[RecentProjects] No version subdirectories found");
                    return [];
                }

                // Sort descending to get the highest version directory
                subdirs.sort(function(a, b) {
                    return parseFloat(b) - parseFloat(a);
                });

                var highestVersionDir = path.join(aePrefsBaseDir, subdirs[0]);
                console.log("[RecentProjects] Using AE preferences folder:", highestVersionDir);

                // Find the Prefs.txt file (e.g., Adobe After Effects 26.2 Prefs.txt)
                var files = fs.readdirSync(highestVersionDir);
                var prefsFile = files.findfunction(file ) {
                    return file.startsWith('Adobe After Effects') && file.endsWith('Prefs.txt');
                });

                if (!prefsFile) {
                    console.log("[RecentProjects] Prefs.txt file not found in:", highestVersionDir);
                    return [];
                }

                var prefsPath = path.join(highestVersionDir, prefsFile);
                var content = fs.readFileSync(prefsPath, 'utf8');

                // Preprocess line continuations: replace backslash + newline + tabs + optional quotes
                // Example of AE wrapping:
                // "MRU Project Path ID # 9, File Path" = "/Volumes/SomePath"\\
                // \t\t"remainder.aep"
                var cleanedContent = content.replace(/\\\r?\n\t*"/g, '');

                var projects = {};
                var match;

                // Match paths
                var pathRegex = /"MRU Project Path ID # (\d+), File Path" = "(.*?)"/g;
                while ((match = pathRegex.exec(cleanedContent)) !== null) {
                    var id = match[1];
                    var filePath = match[2];
                    if (filePath && filePath.toLowerCase().endsWith('.aep')) {
                        if (!projects[id]) projects[id] = {};
                        projects[id].id = parseInt(id, 10);
                        projects[id].path = filePath;
                    }
                }

                // Match timestamps
                var timeRegex = /"MRU Project Path ID # (\d+), Last Opened" = "(.*?)"/g;
                while ((match = timeRegex.exec(cleanedContent)) !== null) {
                    var id = match[1];
                    var timestamp = match[2];
                    if (projects[id]) {
                        projects[id].timestamp = timestamp;
                        projects[id].isoDate = parseAETimestamp(timestamp);
                    }
                }

                // Convert to array and filter out entries that have no path
                var list = Object.keys(projects)
                    .mapfunction(key ) { return projects[key]; })
                    .filterfunction(proj ) { return proj.path; });

                // Dynamically inject/update the last known active project path (which AE hasn't written to disk yet)
                if (currentlyOpenProjectPath && currentlyOpenProjectPath !== "none") {
                    var normalizedOpenPath = currentlyOpenProjectPath.replace(/\\/g, '/');
                    var found = false;
                    for (var i = 0; i < list.length; i++) {
                        var normalizedProjPath = list[i].path.replace(/\\/g, '/');
                        if (normalizedProjPath === normalizedOpenPath) {
                            list[i].isoDate = currentlyOpenProjectLastActive;
                            list[i].timestamp = new Date(currentlyOpenProjectLastActive).toISOString();
                            found = true;
                            break;
                        }
                    }
                    if (!found && currentlyOpenProjectPath.toLowerCase().endsWith('.aep')) {
                        list.push({
                            id: 999, // temporary ID
                            path: currentlyOpenProjectPath,
                            timestamp: new Date(currentlyOpenProjectLastActive).toISOString(),
                            isoDate: currentlyOpenProjectLastActive
                        });
                    }
                }

                // Sort by date (descending) or by ID if no timestamp (lower ID usually means more recent in MRU)
                list.sort(function(a, b) {
                    if (a.isoDate && b.isoDate) {
                        return new Date(b.isoDate) - new Date(a.isoDate);
                    }
                    return a.id - b.id; // Fallback
                });

                // Return top 5 recent files
                return list.slice(0, 5);
            } catch (err) {
                console.error("[RecentProjects] Error loading native recent projects:", err);
                return [];
            }
        }

        // Render projects inside our glassmorphic panel list
        function renderRecentProjectsList() {
            var listEl = document.getElementById('recent-projects-list');
            if (!listEl) return;

            var recentProjects = getNativeRecentProjects();
            if (recentProjects.length === 0) {
                listEl.innerHTML = `
                    <div style="font-size:11px; color:var(--text-muted); text-align:center; padding: 12px 0;">
                        No recent After Effects projects found.
                    </div>
                `;
                return;
            }

            listEl.innerHTML = "";
            recentProjects.forEachfunction(proj ) {
                var basename = proj.path.split(/[/\\]/).pop();
                var relativeTime = proj.isoDate ? formatRelativeTime(proj.isoDate) : "";
                
                // Escape paths properly for string parameters inside HTML
                var escapedPath = proj.path.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

                var row = document.createElement('div');
                row.className = "recent-proj-row";
                row.onclick = ()function( ) { return openRecentProject(escapedPath; });
                row.innerHTML = `
                    <span class="material-symbols-rounded proj-icon" style="font-size:18px;">receipt_long</span>
                    <div class="proj-info">
                        <span class="proj-name">${basename}</span>
                        <span class="proj-path" title="${proj.path}">${proj.path}</span>
                    </div>
                    ${relativeTime ? `<span class="proj-time">${relativeTime}</span>` : ""}
                `;
                listEl.appendChild(row);
            });
        }

        // Run ExtendScript to open the project file
        function openRecentProject(projectPath) {
            if (!projectPath) return;
            console.log("[RecentProjects] Opening project:", projectPath);
            showToast("Opening project...", "success"); // Show safe loading toast
            
            var script = `(function() {
                try {
                    var file = new File("${projectPath}");
                    if (file.exists) {
                        app.open(file);
                        return JSON.stringify({ success: true });
                    } else {
                        return JSON.stringify({ error: "File not found" });
                    }
                } catch(e) {
                    return JSON.stringify({ error: e.toString() });
                }
            })()`;
            
            Bridge.eval(script)
                .thenfunction(res ) {
                    if (res && res.success) {
                        showToast("Project opened successfully!", "success");
                        checkProjectStatus(); // Update UI state immediately
                    } else if (res && res.error) {
                        showToast("Failed to open project: " + res.error, "error");
                    } else {
                        showToast("Failed to open project.", "error");
                    }
                })
                .catchfunction(err ) {
                    showToast("Failed to open project: " + err.message, "error");
                });
        }

        // Check if there is an active saved project open in After Effects
        var lastProjectState = null; // Track last state to avoid unnecessary DOM redraws
        function checkProjectStatus() {
            var script = `(function() {
                try {
                    if (app.project && app.project.file) {
                        return JSON.stringify({ path: app.project.file.fsName });
                    }
                    return JSON.stringify({ path: "none" });
                } catch (e) {
                    return JSON.stringify({ path: "none" });
                }
            })()`;

            Bridge.eval(script)
                .thenfunction(res ) {
                    var card = document.getElementById('card-recent-projects');

                    if (!card) return;

                    var projectPath = res ? res.path : "none";
                    var hasProjectOpen = projectPath && projectPath !== "none";

                    if (hasProjectOpen) {
                        // Keep track of the currently open project path and update its active timestamp in memory
                        currentlyOpenProjectPath = projectPath;
                        currentlyOpenProjectLastActive = new Date().toISOString();

                        // Persist to local JSON cache file so it stays across panel reloads
                        try {
                            if (!fs.existsSync(EASE_LIB_DIR)) fs.mkdirSync(EASE_LIB_DIR, { recursive: true });
                            fs.writeFileSync(RECENT_CACHE_FILE, JSON.stringify({
                                path: currentlyOpenProjectPath,
                                lastActive: currentlyOpenProjectLastActive
                            }), 'utf8');
                        } catch(e) {
                            console.error("[RecentProjects] Failed to save recent cache:", e);
                        }
                    }

                    if (lastProjectState !== hasProjectOpen) {
                        lastProjectState = hasProjectOpen;
                        if (hasProjectOpen) {
                            // Slide out and fade away
                            card.classList.add('hidden-proj');
                            // Delay actual display = none to allow transition to complete
                            setTimeout(()function( ) {
                                if (lastProjectState === true) {
                                    card.style.display = 'none';
                                }
                            }, 500);
                        } else {
                            // Show and slide in
                            renderRecentProjectsList(); // Refresh list on show
                            card.style.display = 'block';
                            // Force reflow
                            card.offsetHeight;
                            card.classList.remove('hidden-proj');
                        }
                    }
                })
                .catchfunction(err ) {
                    console.error("[RecentProjects] Error checking project status:", err);
                });
        }
        
        setupTabs();

        // ── INITIALIZE RECENT PROJECTS CHECKS & LISTENERS ───────────
        checkProjectStatus();
        setInterval(checkProjectStatus, 3000);
        
        document.querySelectorAll('.tab-btn').forEachfunction(btn ) {
            btn.addEventListener('click', ()function( ) {
                if (btn.getAttribute('data-target') === 'mod-home') {
                    checkProjectStatus();
                }
            });
        });

        var originalParents = {};
        var originalNextSiblings = {};
        var cardsRegistered = false;

        function renderHomeWidgets() {
            var container = document.getElementById('home-widgets');
            if(!container) return;
            
            if (!cardsRegistered) {
                document.querySelectorAll('.card').forEach(function(c) {
                    originalParents[c.id] = c.parentNode;
                    originalNextSiblings[c.id] = c.nextSibling;
                });
                cardsRegistered = true;
            }
            
            document.querySelectorAll('.moved-placeholder').forEach(function(el) { el.remove(); });

            Array.from(container.children).forEach(function(child) {
                var isWrapper = child.classList.contains('card-wrapper');
                var cardId = isWrapper ? child.id.replace('wrapper-', '') : child.id;
                var p = originalParents[cardId];
                var n = originalNextSiblings[cardId];
                if (p) {
                    if (n) { p.insertBefore(child, n); } 
                    else { p.appendChild(child); }
                    if (!isWrapper) child.style.display = 'none';
                    else {
                        var innerCard = child.querySelector('.card');
                        if (innerCard) innerCard.style.display = 'none';
                        child.style.display = 'none';
                    }
                }
            });
            
            var saved = [];
            try {
                var csInterface = new CSInterface();
                var appName = csInterface.getHostEnvironment().appName;
                var WIDGETS_FILE = path.join(EASE_LIB_DIR, 'home_widgets_' + appName + '.json');
                var defaultWidgets = (appName === "PPRO") ? ['card-welcome', 'card-recent-projects'] : ['card-welcome', 'card-recent-projects', 'card-memory'];
                if (fs.existsSync(WIDGETS_FILE)) {
                    saved = JSON.parse(fs.readFileSync(WIDGETS_FILE, 'utf8'));
                } else {
                    saved = defaultWidgets;
                }
            } catch(e) { 
                var csInterface = new CSInterface();
                var appName = csInterface.getHostEnvironment().appName;
                saved = (appName === "PPRO") ? ['card-welcome'] : ['card-welcome', 'card-recent-projects', 'card-memory'];
            }
            
            var csInterface2 = new CSInterface();
            var appName2 = csInterface2.getHostEnvironment().appName;

            saved.forEach(function(id) {
                var original = document.getElementById(id);
                if (original) {
                    if (appName2 === "PPRO" && original.classList.contains('ae-only')) return;
                    if (appName2 === "AEFT" && original.classList.contains('pr-only')) return;
                    
                    var mod = null;
                    var origP = originalParents[id];
                    if (origP) { mod = origP.closest('.module-container'); }
                    else { mod = original.closest('.module-container'); }
                    if (mod) {
                        var tabBtn = document.querySelector('.tab-btn[data-target="' + mod.id + '"]');
                        if (tabBtn) {
                            if (appName2 === "PPRO" && tabBtn.classList.contains('ae-only')) return;
                            if (appName2 === "AEFT" && tabBtn.classList.contains('pr-only')) return;
                        }
                    }
                    
                    // Create placeholder in original location
                    var p = originalParents[id];
                    var n = originalNextSiblings[id];
                    if (p && id !== 'card-welcome' && id !== 'card-recent-projects' && id !== 'card-memory') {
                        var labelName = id.replace('card-', '').replace(/-/g, ' ');
                        labelName = labelName.charAt(0).toUpperCase() + labelName.slice(1);
                        var sectionLabel = original.querySelector('.section-label');
                        if (sectionLabel) labelName = sectionLabel.innerText;
                        
                        var ph = document.createElement('div');
                        ph.className = 'card moved-placeholder';
                        ph.style.display = 'flex';
                        ph.style.flexDirection = 'column';
                        ph.style.alignItems = 'center';
                        ph.style.justifyContent = 'center';
                        ph.style.padding = '24px 16px';
                        ph.style.textAlign = 'center';
                        ph.style.border = '1px dashed var(--border-strong)';
                        ph.style.background = 'rgba(255,255,255,0.02)';
                        ph.innerHTML = '<span class="material-symbols-rounded" style="font-size:24px; color:var(--accent-primary); margin-bottom:8px; opacity:0.8;">push_pin</span><span style="font-size:11px; color:var(--text-secondary);"><b>' + labelName + '</b> is currently pinned to your Dashboard.</span>';
                        
                        if (n) { p.insertBefore(ph, n); }
                        else { p.appendChild(ph); }
                    }

                    // Respect real-time open project state for the recent projects card display
                    if (id === 'card-recent-projects') {
                        original.style.display = (lastProjectState === true) ? 'none' : 'block';
                    } else {
                        original.style.display = 'block';
                    }
                    
                    var elementToAppend = original;
                    if (original.parentElement && original.parentElement.classList.contains('card-wrapper')) {
                        elementToAppend = original.parentElement;
                        elementToAppend.style.display = original.style.display === 'none' ? 'none' : 'flex';
                    }
                    container.appendChild(elementToAppend);
                }
            });

            // Fallback: If recent projects card was not in saved JSON (and thus not appended in the loop),
            // put it inside the container, immediately after the welcome card (or at the top if welcome card is unpinned)
            if (appName2 !== "PPRO") {
                var recentCard = document.getElementById('card-recent-projects');
                var recentWrapper = (recentCard && recentCard.parentElement && recentCard.parentElement.classList.contains('card-wrapper')) ? recentCard.parentElement : recentCard;
                
                if (recentCard && recentWrapper.parentNode !== container) {
                    var welcomeCard = document.getElementById('card-welcome');
                    var welcomeWrapper = (welcomeCard && welcomeCard.parentElement && welcomeCard.parentElement.classList.contains('card-wrapper')) ? welcomeCard.parentElement : welcomeCard;
                    
                    if (welcomeCard && welcomeWrapper.parentNode === container) {
                        if (welcomeWrapper.nextSibling) {
                            container.insertBefore(recentWrapper, welcomeWrapper.nextSibling);
                        } else {
                            container.appendChild(recentWrapper);
                        }
                    } else {
                        if (container.firstChild) {
                            container.insertBefore(recentWrapper, container.firstChild);
                        } else {
                            container.appendChild(recentWrapper);
                        }
                    }
                    // Ensure correct display based on active project state
                    recentCard.style.display = (lastProjectState === true) ? 'none' : 'block';
                    if (recentWrapper !== recentCard) recentWrapper.style.display = recentCard.style.display === 'none' ? 'none' : 'flex';
                }
            }
        }
        
        
        var activeConfirmCallback = null;
        function showConfirmModal(title, msg, callback, btnText, btnColor) {
            document.getElementById('confirm-title').innerText = title;
            document.getElementById('confirm-desc').innerText = msg;
            var btn = document.getElementById('confirm-btn-yes');
            btn.innerText = btnText || "Delete";
            if (btnColor) {
                btn.style.background = btnColor;
                btn.style.borderColor = btnColor;
            } else {
                btn.style.background = "var(--accent-danger)";
                btn.style.borderColor = "var(--accent-danger)";
            }
            activeConfirmCallback = callback;
            document.getElementById('confirm-modal').style.display = 'flex';
        }
        function closeConfirmModal() {
            document.getElementById('confirm-modal').style.display = 'none';
            activeConfirmCallback = null;
        }
        document.getElementById('confirm-btn-yes').addEventListener('click', function() {
            var cb = activeConfirmCallback;
            closeConfirmModal();
            if (cb) cb();
        });

        // OS Organize Security Flow
        var osOrgTimer = null;
        var osOrgCountdown = 5;
        var activeOsOrgPath = "";
        
        function promptOsOrganizeProject() {
            Bridge.eval('pipeline.selectOSFolder()').then(function(resData) {
                if (resData === "Cancelled.") return;
                
                var path = resData.path;
                activeOsOrgPath = path;
                
                if (localStorage.getItem('dontAskOsOrganize') === 'true') {
                    exec('pipeline', 'osOrganizeProject', {path: path});
                    return;
                }
                
                var pathParts = path.replace(/\\/g, '/').split('/');
                var shortPath = path;
                if (pathParts.length > 2) {
                    shortPath = '... / ' + pathParts[pathParts.length - 2] + ' / ' + pathParts[pathParts.length - 1];
                }
                
                document.getElementById('os-org-path-display').innerText = shortPath;
                document.getElementById('os-org-modal').style.display = 'flex';
                document.getElementById('os-org-dont-ask-container').style.display = 'none';
                document.getElementById('os-org-dont-ask').checked = false;
                
                var btnOk = document.getElementById('os-org-btn-ok');
                btnOk.disabled = true;
                btnOk.innerText = 'OK (Wait ' + 5 + 's)';
                osOrgCountdown = 5;
                var phase = 1;
                
                clearInterval(osOrgTimer);
                osOrgTimer = setInterval(function() {
                    osOrgCountdown--;
                    if (osOrgCountdown <= 0) {
                        if (phase === 1) {
                            document.getElementById('os-org-dont-ask-container').style.display = 'flex';
                            phase = 2;
                            osOrgCountdown = 3;
                            btnOk.innerText = 'OK (Wait ' + osOrgCountdown + 's)';
                        } else {
                            clearInterval(osOrgTimer);
                            btnOk.innerText = 'OK';
                            btnOk.disabled = false;
                        }
                    } else {
                        btnOk.innerText = 'OK (Wait ' + osOrgCountdown + 's)';
                    }
                }, 1000);
            }).catch(function(err) {
                if (err.message && err.message !== "Cancelled.") {
                    showToast(err.message, 'error');
                }
            });
        }
        
        function handleOsOrgCheckbox() {
            // Checkbox interaction no longer resets the timer, the 3s delay is automatic.
        }
        
        function closeOsOrgModal() {
            clearInterval(osOrgTimer);
            document.getElementById('os-org-modal').style.display = 'none';
        }
        
        function confirmOsOrg() {
            var isChecked = document.getElementById('os-org-dont-ask').checked;
            if (isChecked) {
                localStorage.setItem('dontAskOsOrganize', 'true');
            }
            closeOsOrgModal();
            if (activeOsOrgPath) {
                exec('pipeline', 'osOrganizeProject', {path: activeOsOrgPath});
            }
        }

        var undoAeTimer = null;
        var undoAeCountdown = 20;

        function triggerAeOrganize() {
            exec('pipeline', 'organizeProject');
            
            // Show the Redo/Undo button container
            document.getElementById('undo-ae-container').style.display = 'flex';
            var btn = document.getElementById('undo-ae-btn');
            undoAeCountdown = 20;
            btn.innerText = 'Redo Last (' + undoAeCountdown + 's)';
            
            clearInterval(undoAeTimer);
            undoAeTimer = setInterval(function() {
                undoAeCountdown--;
                if (undoAeCountdown <= 0) {
                    closeUndoAe();
                } else {
                    btn.innerText = 'Redo Last (' + undoAeCountdown + 's)';
                }
            }, 1000);
        }
        
        function closeUndoAe() {
            clearInterval(undoAeTimer);
            var container = document.getElementById('undo-ae-container');
            if (container) container.style.display = 'none';
        }

        function undoLastAction() {
            var csInterface = new CSInterface();
            csInterface.evalScript('app.executeCommand(app.findMenuCommandId("Undo"))');
            closeUndoAe();
        }

        function openCustomizeModal() {
            var modal = document.getElementById('customize-modal');
            modal.style.display = 'flex';
            
            var csInterface = new CSInterface();
            var appName = csInterface.getHostEnvironment().appName;
            
            var saved = [];
            try {
                var WIDGETS_FILE = path.join(EASE_LIB_DIR, 'home_widgets_' + appName + '.json');
                var defaultWidgets = (appName === "PPRO") ? ['card-welcome', 'card-recent-projects'] : ['card-welcome', 'card-recent-projects', 'card-memory'];
                if (fs.existsSync(WIDGETS_FILE)) {
                    saved = JSON.parse(fs.readFileSync(WIDGETS_FILE, 'utf8'));
                } else {
                    saved = defaultWidgets;
                }
            } catch(e) { 
                saved = (appName === "PPRO") ? ['card-welcome', 'card-recent-projects'] : ['card-welcome', 'card-recent-projects', 'card-memory'];
            }
            
            var listContainer = document.getElementById('customize-list');
            listContainer.innerHTML = '';
            
            // Collect cards and group by their ORIGINAL module
            var groups = {};
            var allCards = document.querySelectorAll('.card[id]');

            allCards.forEach(function(card) {
                if (card.id === 'card-settings' || card.id === 'card-about' || card.id === 'card-output-auto') return; // Exclude system cards
                
                var mod = null;
                // If it was moved, originalParents knows its true parent
                var originalParent = typeof originalParents !== 'undefined' ? originalParents[card.id] : null;
                if (originalParent) {
                    mod = originalParent.closest('.module-container');
                } else {
                    mod = card.closest('.module-container');
                }
                
                if (!mod || mod.id === 'mod-info' || mod.id === 'mod-output' || mod.id === 'mod-backup') return;
                
                // Filter by Host App (PR vs AE)
                var tabBtn = document.querySelector('.tab-btn[data-target="' + mod.id + '"]');
                if (tabBtn) {
                    if (appName === "PPRO" && tabBtn.classList.contains('ae-only')) return;
                    if (appName === "AEFT" && tabBtn.classList.contains('pr-only')) return;
                }
                // Also check if the card itself has specific classes
                if (appName === "PPRO" && card.classList.contains('ae-only')) return;
                if (appName === "AEFT" && card.classList.contains('pr-only')) return;

                var modId = mod.id;
                if (!groups[modId]) groups[modId] = [];
                groups[modId].push(card);
            });
            
            // Define order
            var modOrder = ['mod-home', 'mod-rigging', 'mod-kinetics', 'mod-design', 'mod-loader'];
            
            modOrder.forEach(function(modId) {
                if (!groups[modId] || groups[modId].length === 0) return;
                
                var modName = modId.replace('mod-', '').toUpperCase();
                if (modName === 'OUTPUT') modName = 'RENDER';
                
                var modHeader = document.createElement('div');
                modHeader.style.fontSize = '11px';
                modHeader.style.fontWeight = 'bold';
                modHeader.style.color = 'var(--accent-primary)';
                modHeader.style.marginTop = '12px';
                modHeader.style.marginBottom = '6px';
                modHeader.innerText = modName;
                listContainer.appendChild(modHeader);
                
                groups[modId].forEach(function(card) {
                    var labelName = card.id.replace('card-', '').replace(/-/g, ' ');
                    labelName = labelName.charAt(0).toUpperCase() + labelName.slice(1);
                    
                    var sectionLabel = card.querySelector('.section-label');
                    if (sectionLabel) labelName = sectionLabel.innerText;
                    
                    var isChecked = saved.indexOf(card.id) !== -1 ? 'checked' : '';
                    
                    var labelEl = document.createElement('label');
                    labelEl.style.fontSize = '12px';
                    labelEl.style.display = 'flex';
                    labelEl.style.alignItems = 'center';
                    labelEl.style.gap = '8px';
                    labelEl.style.cursor = 'pointer';
                    labelEl.style.marginLeft = '4px';
                    labelEl.style.marginBottom = '4px';
                    labelEl.innerHTML = '<input type="checkbox" value="' + card.id + '" ' + isChecked + '> <span style="flex:1;">' + labelName + '</span>';
                    listContainer.appendChild(labelEl);
                });
            });
        }
        
        function closeCustomizeModal() {
            document.getElementById('customize-modal').style.display = 'none';
        }
        
        function saveCustomizeModal() {
            var checkboxes = document.getElementById('customize-list').querySelectorAll('input[type="checkbox"]');
            var selected = [];
            checkboxes.forEach(function(cb) {
                if (cb.checked) selected.push(cb.value);
            });
            try {
                var csInterface = new CSInterface();
                var appName = csInterface.getHostEnvironment().appName;
                var WIDGETS_FILE = path.join(EASE_LIB_DIR, 'home_widgets_' + appName + '.json');
                if (!fs.existsSync(EASE_LIB_DIR)) fs.mkdirSync(EASE_LIB_DIR, {recursive: true});
                fs.writeFileSync(WIDGETS_FILE, JSON.stringify(selected, null, 2), 'utf8');
            } catch(e) { console.error('Failed to save widgets:', e); }
            closeCustomizeModal();
            renderHomeWidgets();
        }

        // Init on load
        window.addEventListener('DOMContentLoaded', function() {
            updateWingmanPreview();
            updateWigglePreview();
            renderLibrary();
            renderExprLibrary();
            startContextPolling();
            renderHomeWidgets();
            
            // Setup Segmented Control for Time Range
            document.addEventListener('change', function(e) {
                if(e.target.name === 'render_range') {
                    var group = document.getElementById('time-range-group');
                    if(group) {
                        group.querySelectorAll('.segmented-control').forEach(function(label) {
                            label.classList.remove('active');
                        });
                        e.target.parentElement.classList.add('active');
                    }
                }
            });
        });

        
        // ── Keyframe Wingman helpers ────────────────────────────────────
        function buildCurvePath(easeOut, easeIn, W, H) {
            var p1x = (easeOut / 100) * W;
            var p1y = H;
            var p2x = W - (easeIn / 100) * W;
            var p2y = 0;
            return 'M 0 ' + H + ' C ' + p1x + ' ' + p1y + ', ' + p2x + ' ' + p2y + ', ' + W + ' 0';
        }

        function updateWingmanPreview() {
            var eOut = parseInt(document.getElementById('ease-out-slider').value);
            var eIn  = parseInt(document.getElementById('ease-in-slider').value);
            var path = buildCurvePath(eOut, eIn, 80, 80);
            var curveEl = document.getElementById('wingman-curve');
            if (curveEl) curveEl.setAttribute('d', path);
        }

        // ── Wiggle Pro helpers ──────────────────────────────────────────
        function updateWigglePreview() {
            var freq = parseFloat(document.getElementById('wig-freq').value) || 2;
            var amp = parseFloat(document.getElementById('wig-amp').value) || 50;
            
            var W = 180;
            var H = 40;
            var centerY = H / 2;
            
            // Map amp (1-500) to pixel amplitude (max 18px so it doesn't clip)
            var pixelAmp = Math.min((amp / 100) * 12, 18); // scale down visually so 50 amp looks good
            pixelAmp = Math.max(pixelAmp, 1); // at least 1px wave
            
            // Map freq (0.1 - 20) to number of waves visible
            var numWaves = Math.max(freq, 0.5); 
            
            var pathParts = [];
            for (var x = 0; x <= W; x += 2) {
                var angle = (x / W) * numWaves * Math.PI * 2;
                var y = centerY - Math.sin(angle) * pixelAmp; // standard math coords
                pathParts.push((x === 0 ? 'M' : 'L') + ' ' + x.toFixed(1) + ' ' + y.toFixed(1));
            }
            
            var curveEl = document.getElementById('wiggle-curve');
            if (curveEl) curveEl.setAttribute('d', pathParts.join(' '));
        }

        function applyWingman(mode) {
            exec('motion', 'applyEaseSlider', {
                easeOut: document.getElementById('ease-out-slider').value,
                easeIn:  document.getElementById('ease-in-slider').value,
                mode:    mode
            });
        }

        function updateWingmanUI(out, inVal) {
            document.getElementById('ease-out-slider').value = out;
            document.getElementById('ease-out-val-input').value = out;
            document.getElementById('ease-in-slider').value = inVal;
            document.getElementById('ease-in-val-input').value = inVal;
            updateWingmanPreview();
        }

        function setWingman(out, inVal) {
            updateWingmanUI(out, inVal);
            applyWingman('both');
        }

        // ── Ease Library (File System) ─────────────────────────────────

        function getEaseLibrary() {
            try {
                if (!fs.existsSync(EASE_LIB_DIR)) fs.mkdirSync(EASE_LIB_DIR, {recursive: true});
                if (!fs.existsSync(EASE_LIB_FILE)) return [];
                return JSON.parse(fs.readFileSync(EASE_LIB_FILE, 'utf8'));
            } catch(e) { return []; }
        }
        
        function saveEaseLibrary(lib) {
            try {
                if (!fs.existsSync(EASE_LIB_DIR)) fs.mkdirSync(EASE_LIB_DIR, {recursive: true});
                fs.writeFileSync(EASE_LIB_FILE, JSON.stringify(lib, null, 2), 'utf8');
            } catch(e) { alert('Error saving preset: ' + e); }
        }

        function saveEasePreset() {
            var name = document.getElementById('ease-save-name').value.trim();
            if (!name) { document.getElementById('ease-save-name').focus(); return; }
            
            Bridge.loadJSX('motion.jsx').then(function() {
                Bridge.callMethod('motion', 'run', { action: 'getRawEaseData' })
                    .then(function(res) {
                        var rawData = null;
                        var eOut = parseInt(document.getElementById('ease-out-slider').value);
                        var eIn  = parseInt(document.getElementById('ease-in-slider').value);
                        
                        if (typeof res === 'string') {
                            try { res = JSON.parse(res); } catch(e){}
                        }
                        
                        // Bridge.js auto-unwraps JSON.parse and res.data
                        if (res && res.inInfluence !== undefined) {
                            rawData = res;
                            eOut = Math.round(rawData.outInfluence);
                            eIn  = Math.round(rawData.inInfluence);
                        } else {
                            // Silently fallback to saving UI sliders if no AE data
                            rawData = null;
                        }
                        
                        var lib  = getEaseLibrary();
                        lib.push({ 
                            id: Date.now(), 
                            name: name, 
                            easeOut: eOut, 
                            easeIn: eIn,
                            rawData: rawData
                        });
                        
                        saveEaseLibrary(lib);
                        document.getElementById('ease-save-name').value = '';
                        renderLibrary();
                        showToast("Ease saved to library!", "success");
                    });
            });
        }

        function deleteEasePreset(id, e) {
            e.stopPropagation();
            if (!window.SPEED_MODE_ENABLED) {
                showConfirmModal("Delete Preset", "Delete this ease preset?", function() {
                    var lib = getEaseLibrary().filter(function(p) { return p.id !== id; });
                    saveEaseLibrary(lib);
                    renderLibrary();
                });
            } else {
                var lib = getEaseLibrary().filter(function(p) { return p.id !== id; });
                saveEaseLibrary(lib);
                renderLibrary();
            }
        }

        function deleteColorSwatch(id, e) {
            e.stopPropagation();
            if (!window.SPEED_MODE_ENABLED) {
                showConfirmModal("Delete Swatch", "Delete this swatch?", function() {
                    // logic to update color storage
                });
            }
        }

        function loadEasePreset(pId) {
            var lib = getEaseLibrary();
            var preset = null;
            for (var i=0; i<lib.length; i++) { if (lib[i].id === pId) preset = lib[i]; }
            if (!preset) return;
            
            updateWingmanUI(preset.easeOut, preset.easeIn);
            
            if (preset.rawData) {
                exec('motion', 'applyRawEase', { rawData: JSON.stringify(preset.rawData) });
            } else {
                applyWingman('both');
            }
        }

                // ── Loader ──────────────────────────────────────────────────────
        var loaderHidden = false, jsxReady = false;
        function tryHideLoader() {
            if (loaderHidden || !jsxReady) return;
            loaderHidden = true;
            var l = document.getElementById('app-loader');
            if (l) l.classList.add('hidden');
        }
        // Fallback timeout in case Bridge hangs
        setTimeout(()function( ) { jsxReady = true; tryHideLoader(); }, 2500);
        
        Promise.all([
            Bridge.loadJSX('utils.jsx'),
            Bridge.loadJSX('motion.jsx'),
            Bridge.loadJSX('layers.jsx'),
            Bridge.loadJSX('creative.jsx'),
            Bridge.loadJSX('pipeline.jsx'),
        ]).then(()function( ) { jsxReady = true; tryHideLoader(); })
          .catch(()function( ) { jsxReady = true; tryHideLoader(); });
        // ───────────────────────────────────────────────────────────────

        // ── Custom Prompts ────────────────────────────────────────────────
        var promptCallback = null;
        function openTextPrompt(title, desc, callback) {
            document.getElementById('prompt-title').innerText = title;
            document.getElementById('prompt-desc').innerText = desc;
            var input = document.getElementById('prompt-input');
            input.value = '';
            document.getElementById('text-prompt-modal').style.display = 'flex';
            input.focus();
            promptCallback = callback;
        }
        function closeTextPrompt() {
            document.getElementById('text-prompt-modal').style.display = 'none';
            promptCallback = null;
        }
        function submitTextPrompt() {
            var val = document.getElementById('prompt-input').value.trim();
            if (!val) { showToast("Name cannot be empty", "error"); return; }
            document.getElementById('text-prompt-modal').style.display = 'none';
            if (promptCallback) promptCallback(val);
            promptCallback = null;
        }

        function closeToast() {
            var t = document.getElementById('toast-container');
            t.style.bottom = '-80px';
            t.style.opacity = '0';
        }

        function showToast(msg, type) {
            var t = document.getElementById('toast-container');
            var icon = document.getElementById('toast-icon');
            var msgEl = document.getElementById('toast-msg');
            
            if (type === 'error') {
                t.style.background = 'var(--accent-danger, #ef4444)';
                icon.innerText = 'error';
                msgEl.innerText = "Error: " + msg;
            } else {
                t.style.background = 'var(--accent-success, #22c55e)';
                icon.innerText = 'check_circle';
                msgEl.innerText = msg;
            }
            
            t.style.bottom = '0';
            t.style.opacity = '1';
            
            if(window.toastTimer) clearTimeout(window.toastTimer);
            window.toastTimer = setTimeout(function() {
                closeToast();
            }, 5000);
        }

        function exec(module, action, extraArgs) {
            var args = { action: action };
            if (extraArgs) { for (var k in extraArgs) args[k] = extraArgs[k]; }
            
            // Track click for Smart Panel
            trackButtonClick(module, action, extraArgs);
            
            Bridge.loadJSX(module + '.jsx').then(function() {
                Bridge.callMethod(module, 'run', args).then(function(res) { 
                    if (res) showToast(res, 'success');
                }).catch(function(err) { showToast(err.message, 'error'); });
            });
        }

        function renderLibrary() {
            var container = document.getElementById('ease-lib-list');
            var lib = getEaseLibrary();
            if (lib.length === 0) {
                container.innerHTML = '<div class="lib-empty" style="grid-column: 1 / -1; text-align:center; padding: 16px 0; font-size: 11px; color: var(--text-secondary);">No saved presets.</div>';
                return;
            }
            container.innerHTML = lib.map(function(p) {
                var path = buildCurvePath(p.easeOut, p.easeIn, 44, 44);
                return '<div class="ease-lib-card" onclick="loadEasePreset(' + p.id + ')">' +
                    '<button class="lib-del" onclick="deleteEasePreset(' + p.id + ', event)" title="Delete">' +
                        '<span class="material-symbols-rounded" style="font-size:12px;">close</span>' +
                    '</button>' +
                    '<div style="background:var(--bg-active); border:1px solid var(--border-strong); border-radius:4px; padding:4px; margin-bottom:6px; display:flex; justify-content:center; align-items:center;">' +
                        '<svg width="44" height="44" viewBox="0 0 44 44" style="overflow:visible;">' +
                            '<line x1="0" y1="44" x2="44" y2="0" stroke="var(--border-strong)" stroke-width="1.5" stroke-dasharray="3,3"/>' +
                            '<path d="' + path + '" stroke="var(--accent-primary)" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="lib-name">' + p.name + '</div>' +
                    '<div class="lib-vals">O:' + p.easeOut + ' I:' + p.easeIn + '</div>' +
                '</div>';
            }).join('');
        }

        function setupDragAndDrop() {
            var cards = document.querySelectorAll('.card');
            cards.forEach(function(card) {
                // Assign a generic ID if missing to allow sorting
                if (!card.id) {
                    card.id = 'card-auto-' + Math.random().toString(36).substr(2, 9);
                }
                
                if (card.id === 'card-welcome') return;
                if (card.closest('#mod-info')) return; // Skip cards in the Info tab
                
                // Cleanup old drag handle if it was inside the card
                var oldHandle = card.querySelector(':scope > .drag-handle');
                if (oldHandle) {
                    oldHandle.parentNode.removeChild(oldHandle);
                }
                
                var wrapper = card.parentElement;
                if (!wrapper.classList.contains('card-wrapper')) {
                    wrapper = document.createElement('div');
                    wrapper.className = 'card-wrapper';
                    wrapper.id = 'wrapper-' + card.id;
                    
                    // Sync initial inline style display (preserve flex layout for wrapper)
                    wrapper.style.display = card.style.display === 'none' ? 'none' : 'flex';
                    card.style.marginBottom = '0';
                    
                    // Insert wrapper and move card inside
                    card.parentNode.insertBefore(wrapper, card);
                    wrapper.appendChild(card);
                    
                    // Sync display style changes (e.g. from tab search filtering)
                    var observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            if (mutation.attributeName === 'style') {
                                wrapper.style.display = card.style.display === 'none' ? 'none' : 'flex';
                            }
                        });
                    });
                    observer.observe(card, { attributes: true, attributeFilter: ['style'] });
                }
                
                if (!wrapper.querySelector('.reorder-handle')) {
                    var handleGroup = document.createElement('div');
                    handleGroup.className = 'reorder-handle';

                    var btnUp = document.createElement('button');
                    btnUp.className = 'reorder-handle-btn';
                    btnUp.innerHTML = '<span class="material-symbols-rounded">keyboard_arrow_up</span>';
                    btnUp.addEventListener('click', function(e) {
                        e.stopPropagation();
                        var prev = wrapper.previousElementSibling;
                        while (prev && !prev.classList.contains('card-wrapper')) prev = prev.previousElementSibling;
                        if (prev) { wrapper.parentNode.insertBefore(wrapper, prev); saveLayoutOrder(); }
                    });

                    var btnDown = document.createElement('button');
                    btnDown.className = 'reorder-handle-btn';
                    btnDown.innerHTML = '<span class="material-symbols-rounded">keyboard_arrow_down</span>';
                    btnDown.addEventListener('click', function(e) {
                        e.stopPropagation();
                        var next = wrapper.nextElementSibling;
                        while (next && !next.classList.contains('card-wrapper')) next = next.nextElementSibling;
                        if (next) { wrapper.parentNode.insertBefore(next, wrapper); saveLayoutOrder(); }
                    });

                    handleGroup.appendChild(btnUp);
                    handleGroup.appendChild(btnDown);
                    wrapper.insertBefore(handleGroup, card);
                }

                var emptyImg = new Image();
                emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

                wrapper.addEventListener('dragstart', function(e) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', wrapper.id);
                    e.dataTransfer.setDragImage(emptyImg, 0, 0); // Hide native ghost
                    
                    var rect = wrapper.getBoundingClientRect();
                    window._dragOffsetX = e.clientX - rect.left;
                    window._dragOffsetY = e.clientY - rect.top;
                    
                    // Create gorgeous floating clone
                    var clone = wrapper.cloneNode(true);
                    clone.id = 'drag-ghost';
                    clone.style.position = 'fixed';
                    clone.style.pointerEvents = 'none'; // Pass through clicks/drops
                    clone.style.zIndex = '99999';
                    clone.style.width = rect.width + 'px';
                    clone.style.left = e.clientX - window._dragOffsetX + 'px';
                    clone.style.top = e.clientY - window._dragOffsetY + 'px';
                    
                    // Premium floating styles
                    clone.style.opacity = '0.95';
                    clone.style.transform = 'scale(1.02)';
                    clone.style.transformOrigin = 'center center';
                    clone.style.transition = 'none';
                    clone.querySelector('.card').style.boxShadow = '0 16px 32px rgba(0,0,0,0.6)';
                    clone.querySelector('.card').style.borderColor = 'var(--accent-primary)';
                    
                    document.body.appendChild(clone);
                    
                    // Apply dragging placeholder state instantly (no setTimeout delay)
                    wrapper.classList.add('is-dragging');
                    window._isDragging = true;
                    
                    // Store direct reference to container for scroll zones
                    window._scrollTargetContainer = wrapper.closest('.module-container');
                    
                    var cRect = window._scrollTargetContainer.getBoundingClientRect();
                    var szTop = document.getElementById('drag-scroll-top');
                    var szBot = document.getElementById('drag-scroll-bot');
                    if (szTop && szBot) {
                        szTop.style.left = cRect.left + 'px';
                        szTop.style.top = cRect.top + 'px';
                        szTop.style.width = cRect.width + 'px';
                        szBot.style.left = cRect.left + 'px';
                        szBot.style.bottom = (window.innerHeight - cRect.bottom) + 'px';
                        szBot.style.width = cRect.width + 'px';
                        szTop.style.display = 'block';
                        szBot.style.display = 'block';
                    }
                });

                wrapper.addEventListener('dragend', function() {
                    window._isDragging = false;
                    // Hide scroll zones
                    var szTop = document.getElementById('drag-scroll-top');
                    var szBot = document.getElementById('drag-scroll-bot');
                    if (szTop) szTop.style.display = 'none';
                    if (szBot) szBot.style.display = 'none';
                    wrapper.classList.remove('is-dragging');
                    wrapper.setAttribute('draggable', 'false');
                    
                    var ghost = document.getElementById('drag-ghost');
                    if (ghost) ghost.parentNode.removeChild(ghost);
                    
                    // Swap on Drop logic
                    var target = document.querySelector('.is-drop-target');
                    if (target && target !== wrapper) {
                        var parent = target.parentNode;
                        var scrollContainer = target.closest('.module-container') || parent;
                        
                        var draggingIndex = Array.prototype.indexOf.call(parent.children, wrapper);
                        var targetIndex = Array.prototype.indexOf.call(parent.children, target);
                        
                        // Record pre-swap geometry to prevent scroll jumps
                        var rectBefore = target.getBoundingClientRect();
                        
                        if (draggingIndex < targetIndex) {
                            // Dragged downwards: insert AFTER target
                            parent.insertBefore(wrapper, target.nextSibling);
                        } else {
                            // Dragged upwards: insert BEFORE target
                            parent.insertBefore(wrapper, target);
                        }
                        
                        // Compensate scroll position to keep view absolutely perfectly still
                        var rectAfter = target.getBoundingClientRect();
                        scrollContainer.scrollTop += (rectAfter.top - rectBefore.top);
                    }
                    
                    // Cleanup target highlights
                    document.querySelectorAll('.is-drop-target').forEach(function(el) {
                        el.classList.remove('is-drop-target');
                    });
                    
                    saveLayoutOrder();
                });
            });

            if (!window._hasGlobalDragover) {
                document.addEventListener('dragover', function(e) {
                    // Move ghost
                    var ghost = document.getElementById('drag-ghost');
                    if (ghost) {
                        ghost.style.left = (e.clientX - window._dragOffsetX) + 'px';
                        ghost.style.top = (e.clientY - window._dragOffsetY) + 'px';
                    }

                    // Auto-scroll: runs here because document dragover is PROVEN to fire in CEP
                    var c = window._scrollTargetContainer;
                    if (!c || !window._isDragging) return;
                    var r = c.getBoundingClientRect();
                    var zone = 80; // px from edge to trigger scroll
                    var distTop = e.clientY - r.top;
                    var distBot = r.bottom - e.clientY;
                    if (distTop < zone) {
                        // Closer to top = faster scroll up
                        c.scrollTop -= Math.round((zone - distTop) / zone * 60);
                    } else if (distBot < zone) {
                        // Closer to bottom = faster scroll down
                        c.scrollTop += Math.round((zone - distBot) / zone * 60);
                    }
                });
                window._hasGlobalDragover = true;
            }

            var containers = document.querySelectorAll('.module-container');
            containers.forEach(function(container) {

                container.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    
                    var draggingWrapper = document.querySelector('.card-wrapper.is-dragging');
                    if (!draggingWrapper) return;
                    
                    var target = e.target.closest('.card-wrapper');
                    if (target && target !== draggingWrapper) {
                        document.querySelectorAll('.is-drop-target').forEach(function(el) {
                            if (el !== target) el.classList.remove('is-drop-target');
                        });
                        target.classList.add('is-drop-target');
                    } else {
                        document.querySelectorAll('.is-drop-target').forEach(function(el) {
                            el.classList.remove('is-drop-target');
                        });
                    }
                });
            });
        }

        function saveLayoutOrder() {
            var layout = {};
            var containers = document.querySelectorAll('.module-container');
            containers.forEach(function(container) {
                var cardIds = [];
                Array.prototype.slice.call(container.children).forEach(function(child) {
                    if (child.classList.contains('card-wrapper')) {
                        var card = child.querySelector('.card');
                        if (card && card.id) cardIds.push(card.id);
                    } else if (child.classList.contains('card')) {
                        if (child.id) cardIds.push(child.id);
                    }
                });
                layout[container.id] = cardIds;
            });
            var csInterface = new CSInterface();
            var appName = csInterface.getHostEnvironment().appName;
            localStorage.setItem('motionreis_layout_' + appName, JSON.stringify(layout));
        }

        function loadLayoutOrder() {
            var csInterface = new CSInterface();
            var appName = csInterface.getHostEnvironment().appName;
            var saved = localStorage.getItem('motionreis_layout_' + appName);
            if (!saved) return;
            try {
                var layout = JSON.parse(saved);
                for (var containerId in layout) {
                    var container = document.getElementById(containerId);
                    if (!container) continue;
                    var order = layout[containerId];
                    order.forEach(function(cardId) {
                        var card = document.getElementById(cardId);
                        if (!card) return;
                        var elementToMove = card.parentElement.classList.contains('card-wrapper') ? card.parentElement : card;
                        if (elementToMove && elementToMove.parentElement && elementToMove.parentElement.id === containerId) {
                            container.appendChild(elementToMove);
                        }
                    });
                }
            } catch(e) {}
        }

        // Init on load
        window.addEventListener('DOMContentLoaded', function() {
            var csInterface = new CSInterface();
            var appName = csInterface.getHostEnvironment().appName;
            
            if (appName === "PPRO") {
                var aeOnlyEls = document.querySelectorAll('.ae-only');
                aeOnlyEls.forEach(function(el) { el.style.display = 'none'; });
            } else if (appName === "AEFT") {
                var prOnlyEls = document.querySelectorAll('.pr-only');
                prOnlyEls.forEach(function(el) { el.style.display = 'none'; });
            }

            setupDragAndDrop();
            loadLayoutOrder();

            updateWingmanPreview();
            updateWigglePreview();
            renderLibrary();
            renderExprLibrary();
            startContextPolling();
            initApiConfig();
        });

        // ==========================================
        // AI Loader: API Configuration
        // ==========================================
        function initApiConfig() {
            var platformSelect = document.getElementById('ai-platform-select');
            var keyInput = document.getElementById('multi-api-key');
            var modelSelect = document.getElementById('multi-model-select');
            var btnSave = document.getElementById('btn-save-ai-config');
            var btnConnect = document.getElementById('btn-connect-ai');
            
            if(!platformSelect || !keyInput || !modelSelect) return;

            var csInterface = new CSInterface();
            var appName = csInterface.getHostEnvironment().appName;
            var storageKey = 'motionreis_ai_config_' + appName;

            var fs = require('fs');
            var path = require('path');
            var crypto = require('crypto');
            var sysPath = csInterface.getSystemPath(SystemPath.USER_DATA);
            var fsConfigPath = path.join(sysPath, 'motionreis_ai_config_' + appName + '.json');
            var ENC_KEY = "motionreis-super-secret-key-1234";

            window.ai_obfuscate = function(str) {
                try {
                    var iv = crypto.randomBytes(16);
                    var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENC_KEY), iv);
                    var encrypted = cipher.update(str);
                    encrypted = Buffer.concat([encrypted, cipher.final()]);
                    return iv.toString('hex') + ':' + encrypted.toString('hex');
                } catch(e) {
                    return btoa(str.split('').reverse().join(''));
                }
            };
            window.ai_deobfuscate = function(str) {
                try {
                    if (str.indexOf(':') > -1) {
                        var textParts = str.split(':');
                        var iv = Buffer.from(textParts.shift(), 'hex');
                        var encryptedText = Buffer.from(textParts.join(':'), 'hex');
                        var decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENC_KEY), iv);
                        var decrypted = decipher.update(encryptedText);
                        decrypted = Buffer.concat([decrypted, decipher.final()]);
                        return decrypted.toString();
                    } else {
                        return atob(str).split('').reverse().join('');
                    }
                } catch(e) { return ''; }
            };
            
            window.ai_getSavedConfig = function() {
                try {
                    if (fs.existsSync(fsConfigPath)) {
                        return fs.readFileSync(fsConfigPath, 'utf8');
                    }
                } catch(e) {}
                return localStorage.getItem(storageKey);
            };
            
            window.ai_setSavedConfig = function(val) {
                try { fs.writeFileSync(fsConfigPath, val, 'utf8'); } catch(e) {}
                localStorage.setItem(storageKey, val);
            };
            
            window.ai_clearSavedConfig = function() {
                try { if (fs.existsSync(fsConfigPath)) fs.unlinkSync(fsConfigPath); } catch(e) {}
                localStorage.removeItem(storageKey);
            };

            function obfuscate(str) { return window.ai_obfuscate(str); }
            function deobfuscate(str) { return window.ai_deobfuscate(str); }

            function renderActiveConfig() {
                var saved = window.ai_getSavedConfig();
                
                // AUTO MIGRATION: If no new config, check old config
                if (!saved) {
                    var oldKey = localStorage.getItem('motionreis_gcp_api_keys_' + appName);
                    if (oldKey) {
                        try {
                            var oldArray = JSON.parse(oldKey);
                            if (oldArray && oldArray.length > 0) {
                                var newConfig = {
                                    platform: 'gemini',
                                    key: obfuscate(oldArray[0]),
                                    model: 'gemini-2.5-flash'
                                };
                                window.ai_setSavedConfig(JSON.stringify(newConfig));
                                saved = JSON.stringify(newConfig);
                            }
                        } catch(e) {}
                    }
                }

                var activeDiv = document.getElementById('active-ai-config');
                var textEl = document.getElementById('active-ai-text');
                var keyEl = document.getElementById('active-ai-key-text');
                var iconEl = document.getElementById('active-ai-platform-icon');
                
                if (saved) {
                    try {
                        var config = JSON.parse(saved);
                        if (config.platform && config.key && config.model) {
                            var platName = config.platform.charAt(0).toUpperCase() + config.platform.slice(1);
                            var decKey = deobfuscate(config.key);
                            var masked = decKey.length > 8 ? decKey.substring(0,4) + '...' + decKey.substring(decKey.length-4) : '***';
                            
                            textEl.innerText = platName + " (" + config.model + ")";
                            keyEl.innerText = masked;
                            activeDiv.style.display = 'block';
                            
                            // Restore to inputs
                            platformSelect.value = config.platform;
                            keyInput.value = ''; // Always keep input empty as requested
                            modelSelect.innerHTML = '<option value="'+config.model+'">'+config.model+'</option>';
                            modelSelect.value = config.model;
                            modelSelect.disabled = false;
                            if (btnSave) btnSave.disabled = false;
                            return;
                        }
                    } catch(e) {}
                }
                activeDiv.style.display = 'none';
            }

            renderActiveConfig();

            window.clearAIConfig = function() {
                window.ai_clearSavedConfig();
                renderActiveConfig();
                modelSelect.innerHTML = '<option value="">Awaiting connection...</option>';
                modelSelect.disabled = true;
                keyInput.value = '';
                if (btnSave) btnSave.disabled = true;
                if (typeof showToast === 'function') showToast("Configuration cleared.", "success");
            };

            window.currentAITier = 'free';
            window.switchAITier = function(tier) {
                window.currentAITier = tier;
                var btnFree = document.getElementById('btn-tier-free');
                var btnPaid = document.getElementById('btn-tier-paid');
                if(tier === 'free') {
                    btnFree.style.background = 'var(--accent-primary)';
                    btnFree.style.color = '#fff';
                    btnPaid.style.background = 'var(--bg-app)';
                    btnPaid.style.color = 'var(--text-secondary)';
                } else {
                    btnPaid.style.background = 'var(--accent-primary)';
                    btnPaid.style.color = '#fff';
                    btnFree.style.background = 'var(--bg-app)';
                    btnFree.style.color = 'var(--text-secondary)';
                }
                
                // Selalu panggil connectAIPlatform karena di dalamnya sudah ada fallback ke saved config
                window.connectAIPlatform();
            };

            window.connectAIPlatform = function() {
                var platform = platformSelect.value;
                var key = keyInput.value.trim();
                
                // Fallback to saved key if input is empty
                if (!key) {
                    var saved = window.ai_getSavedConfig();
                    if (saved) {
                        try {
                            var config = JSON.parse(saved);
                            if (config.key) key = window.ai_deobfuscate(config.key);
                        } catch(e) {}
                    }
                }
                
                if (!key) {
                    modelSelect.innerHTML = '<option value="">Please enter an API Key</option>';
                    return;
                }
                
                modelSelect.innerHTML = '<option value="">Fetching models...</option>';
                modelSelect.disabled = true;
                if (btnSave) btnSave.disabled = true;
                
                if (platform === 'gemini') {
                    fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
                    .then(function(res) { if (!res.ok) throw new Error("Invalid"); return res.json(); })
                    .then(function(data) {
                        modelSelect.innerHTML = '';
                        var added = 0;
                        if (data && data.models) {
                            var tier = window.currentAITier || 'free';
                            var group = document.createElement('optgroup');
                            group.label = tier === 'free' ? "Free Tier Models" : "Paid Tier Models";

                            data.models.forEach(function(m) {
                                var val = m.name.replace('models/', '');
                                // Only allow Gemini generative text models, exclude vision/tts/embedding/gemma/nano/aqa
                                if (val.indexOf('gemini') !== -1 && val.indexOf('vision') === -1 && val.indexOf('embedding') === -1 && val.indexOf('tts') === -1 && val.indexOf('aqa') === -1 && val.indexOf('nano') === -1) {
                                    
                                    var isFlash = val.indexOf('flash') !== -1;
                                    var isLite = val.indexOf('lite') !== -1;
                                    var isPro = val.indexOf('pro') !== -1;
                                    var isExp = val.indexOf('exp') !== -1;
                                    
                                    // Filter based on selected tier
                                    if (tier === 'free' && (isPro || isExp)) return; // Free tier excludes Pro/Exp
                                    if (tier === 'paid' && (!isPro && !isExp)) return; // Paid tier requires Pro/Exp
                                    
                                    var opt = document.createElement('option');
                                    opt.value = val;
                                    opt.innerText = m.displayName + " (" + m.version + ")";
                                    group.appendChild(opt);
                                    added++;
                                }
                            });
                            
                            if (group.children.length > 0) modelSelect.appendChild(group);
                        }
                        if (added === 0) modelSelect.innerHTML = '<option value="">No valid models found</option>';
                        else { modelSelect.disabled = false; if (btnSave) btnSave.disabled = false; }
                    }).catch(function(e) { modelSelect.innerHTML = '<option value="">Connection Failed</option>'; });
                } else if (platform === 'openai') {
                    fetch('https://api.openai.com/v1/models', { headers: { 'Authorization': 'Bearer ' + key } })
                    .then(function(res) { if (!res.ok) throw new Error("Invalid"); return res.json(); })
                    .then(function(data) {
                        modelSelect.innerHTML = '';
                        var added = 0;
                        if (data && data.data) {
                            var chatModels = data.data.filter(function(m) { return m.id.indexOf('gpt') !== -1 || m.id.indexOf('o1') !== -1 || m.id.indexOf('o3') !== -1; });
                            chatModels.sort(function(a,b){ return b.created - a.created; });
                            chatModels.forEach(function(m) {
                                var opt = document.createElement('option');
                                opt.value = m.id;
                                opt.innerText = m.id;
                                modelSelect.appendChild(opt);
                                added++;
                            });
                        }
                        if (added === 0) modelSelect.innerHTML = '<option value="">No models found</option>';
                        else { modelSelect.disabled = false; if (btnSave) btnSave.disabled = false; }
                    }).catch(function(e) { modelSelect.innerHTML = '<option value="">Connection Failed</option>'; });
                } else if (platform === 'deepseek') {
                    fetch('https://api.deepseek.com/models', { headers: { 'Authorization': 'Bearer ' + key } })
                    .then(function(res) { if (!res.ok) throw new Error("Invalid"); return res.json(); })
                    .then(function(data) {
                        modelSelect.innerHTML = '';
                        var added = 0;
                        if (data && data.data) {
                            data.data.forEach(function(m) {
                                var opt = document.createElement('option');
                                opt.value = m.id;
                                opt.innerText = m.id;
                                modelSelect.appendChild(opt);
                                added++;
                            });
                        }
                        if (added === 0) modelSelect.innerHTML = '<option value="">No models found</option>';
                        else { modelSelect.disabled = false; if (btnSave) btnSave.disabled = false; }
                    }).catch(function(e) { modelSelect.innerHTML = '<option value="">Connection Failed</option>'; });
                } else if (platform === 'anthropic') {
                    modelSelect.innerHTML = '';
                    var antModels = ['claude-3-5-sonnet-20240620', 'claude-3-5-sonnet-latest', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'];
                    antModels.forEach(function(m) {
                        var opt = document.createElement('option');
                        opt.value = m;
                        opt.innerText = m;
                        modelSelect.appendChild(opt);
                    });
                    modelSelect.disabled = false;
                    if (btnSave) btnSave.disabled = false;
                }
            };
            
            window.saveAIConfig = function() {
                var platform = platformSelect.value;
                var key = keyInput.value.trim();
                var model = modelSelect.value;
                
                if (!key || !model) {
                    if (typeof showToast === 'function') showToast("Please connect and select a model first", "error");
                    return;
                }
                
                var config = {
                    platform: platform,
                    key: obfuscate(key),
                    model: model
                };
                
                window.ai_setSavedConfig(JSON.stringify(config));
                renderActiveConfig();
                if (typeof showToast === 'function') showToast("AI Configuration saved successfully!", "success");
            };
        }

        // --- AI VIRAL CLIPPER LOGIC ---
        // (fs and path are already defined globally)
        function getCP() {
            try { return require('child_process'); }
            catch(e) { return null; }
        }

        window.checkWhisper = function() {
            var cp = getCP();
            if(!cp) return;
            cp.exec('whisper --help', function(error, stdout, stderr) {
                if (error) {
                    document.getElementById('clipper-setup-card').style.display = 'block';
                    document.getElementById('clipper-ready-card').style.display = 'none';
                } else {
                    document.getElementById('clipper-setup-card').style.display = 'none';
                    document.getElementById('clipper-ready-card').style.display = 'block';
                }
            });
        };

        // Call check on load
        setTimeout(function() { if(window.checkWhisper) window.checkWhisper(); }, 1000);

        window.setupWhisper = function() {
            var statusDiv = document.getElementById('whisper-setup-status');
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = 'Menginstall openai-whisper (bisa makan waktu 1-3 menit)...';
            var cp = getCP();
            if(!cp) return;
            cp.exec('pip install -U openai-whisper', function(error, stdout, stderr) {
                if (error) {
                    statusDiv.innerHTML = '<span style="color:red">Error install Whisper. Pastikan Python 3 (pip) terinstall.</span><br>' + error.message;
                    return;
                }
                statusDiv.innerHTML = '<span style="color:green">Install berhasil! Me-refresh status...</span>';
                setTimeout(function() { window.checkWhisper(); }, 2000);
            });
        };

        window.runViralClipper = function() {
            var statusDiv = document.getElementById('clipper-status');
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = 'Menganalisa timeline...';

            var csInterface = new CSInterface();
            
            // 1. Get raw file path from V1/A1
            csInterface.evalScript('getTimelineSourceFile()', function(filePath) {
                if (!filePath || filePath.indexOf('Error') > -1 || filePath === "null") {
                    statusDiv.innerHTML = '<span style="color:red">' + (filePath || "Gagal mendapatkan file mentah klip di timeline. Pastikan ada klip di V1.") + '</span>';
                    return;
                }
                
                statusDiv.innerHTML = 'Men-transkrip file dengan Whisper lokal... (bisa memakan waktu)';
                
                var outDir = csInterface.getSystemPath(SystemPath.EXTENSION) + "/temp";
                if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
                
                // 2. Run Whisper on the file
                var cmd = 'whisper "' + filePath + '" --model base --output_format json --output_dir "' + outDir + '"';
                var cp = getCP();
                if(!cp) return;
                cp.exec(cmd, function(error, stdout, stderr) {
                    if (error) {
                        statusDiv.innerHTML = '<span style="color:red">Gagal transkrip: ' + error.message + '</span>';
                        return;
                    }
                    
                    var baseName = path.basename(filePath, path.extname(filePath));
                    var jsonPath = path.join(outDir, baseName + '.json');
                    
                    if (!fs.existsSync(jsonPath)) {
                        statusDiv.innerHTML = '<span style="color:red">File JSON transkrip tidak ditemukan!</span>';
                        return;
                    }
                    
                    var transcriptData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    statusDiv.innerHTML = 'Menganalisa momen viral dengan AI...';
                    
                    // 3. Send to AI
                    var aiConfig = window.ai_getSavedConfig ? window.ai_getSavedConfig() : null;
                    if (!aiConfig) {
                        statusDiv.innerHTML = '<span style="color:red">Set API Key di tab AI Loader dulu!</span>';
                        return;
                    }
                    var config = JSON.parse(aiConfig);
                    
                    var systemPrompt = "Lu adalah sutradara TikTok pro. Cari 1 momen percakapan paling menarik/lucu/kontroversial berdurasi 30-60 detik dari transkrip yang dikasih. \n\nAturan mutlak:\n1. Output HANYA format JSON valid.\n2. Formatnya: {\"start_time\": waktu_mulai_detik, \"end_time\": waktu_selesai_detik}.\n3. Jangan ada teks apapun selain JSON, tanpa markdown formatting.\n4. Durasi harus sekitar 30-60 detik.";
                    
                    var promptContext = transcriptData.segments.map(function(seg) {
                        return "[" + seg.start + " - " + seg.end + "] " + seg.text;
                    }).join("\n");
                    
                    fetchAIForClipper(config, systemPrompt, promptContext, statusDiv, csInterface, transcriptData.segments, outDir, baseName);
                });
            });
        };
        
        function fetchAIForClipper(config, sysPrompt, userPrompt, statusDiv, csInterface, segments, outDir, baseName) {
            var url, headers, body;
            
            if (config.provider === 'openai' || config.provider === 'deepseek') {
                url = (config.provider === 'deepseek') ? 'https://api.deepseek.com/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
                headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.apiKey };
                body = JSON.stringify({
                    model: config.modelName || 'gpt-4o',
                    messages: [{role: "system", content: sysPrompt}, {role: "user", content: userPrompt}],
                    temperature: 0.2
                });
            } else if (config.provider === 'anthropic') {
                url = 'https://api.anthropic.com/v1/messages';
                headers = { 'Content-Type': 'application/json', 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
                body = JSON.stringify({
                    model: config.modelName || 'claude-3-opus-20240229',
                    system: sysPrompt,
                    messages: [{role: "user", content: userPrompt}],
                    max_tokens: 1000,
                    temperature: 0.2
                });
            } else if (config.provider === 'gemini') {
                url = 'https://generativelanguage.googleapis.com/v1beta/models/' + (config.modelName || 'gemini-1.5-pro') + ':generateContent?key=' + config.apiKey;
                headers = { 'Content-Type': 'application/json' };
                body = JSON.stringify({
                    systemInstruction: { parts: [{ text: sysPrompt }] },
                    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                    generationConfig: { temperature: 0.2 }
                });
            }

            fetch(url, { method: 'POST', headers: headers, body: body })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var reply = "";
                if (config.provider === 'gemini' && data.candidates) reply = data.candidates[0].content.parts[0].text;
                else if (config.provider === 'anthropic' && data.content) reply = data.content[0].text;
                else if (data.choices) reply = data.choices[0].message.content;
                else throw new Error("Invalid API Response");
                
                reply = reply.replace(/```json/g, '').replace(/```/g, '').trim();
                var result = JSON.parse(reply);
                
                statusDiv.innerHTML = 'Membuat file Subtitle (.srt)...';
                
                // Format SRT
                function formatSrtTime(seconds) {
                    var date = new Date(seconds * 1000);
                    var hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
                    var mm = String(date.getUTCMinutes()).padStart(2, '0');
                    var ss = String(date.getUTCSeconds()).padStart(2, '0');
                    var ms = String(date.getUTCMilliseconds()).padStart(3, '0');
                    return hh + ':' + mm + ':' + ss + ',' + ms;
                }
                
                var srtContent = "";
                var srtIndex = 1;
                for (var i = 0; i < segments.length; i++) {
                    var seg = segments[i];
                    if (seg.end > result.start_time && seg.start < result.end_time) {
                        var newStart = Math.max(0, seg.start - result.start_time);
                        var newEnd = seg.end - result.start_time;
                        srtContent += srtIndex + "\n";
                        srtContent += formatSrtTime(newStart) + " --> " + formatSrtTime(newEnd) + "\n";
                        srtContent += seg.text.trim() + "\n\n";
                        srtIndex++;
                    }
                }
                
                var srtPath = path.join(outDir, baseName + "_viral.srt");
                fs.writeFileSync(srtPath, srtContent, 'utf8');
                
                statusDiv.innerHTML = 'Mengeksekusi pemotongan di Premiere...';
                
                // Escape srtPath for ExtendScript
                var safeSrtPath = srtPath.replace(/\\/g, '\\\\');
                var script = 'createVerticalHighlight(' + result.start_time + ', ' + result.end_time + ', "' + safeSrtPath + '")';
                csInterface.evalScript(script, function(res) {
                    if (res && res.indexOf('Error') > -1) {
                        statusDiv.innerHTML = '<span style="color:red">' + res + '</span>';
                    } else {
                        statusDiv.innerHTML = '<span style="color:green">Sukses! Video viral berhasil di-ekstrak.</span>';
                    }
                });
            })
            .catch(function(err) {
                statusDiv.innerHTML = '<span style="color:red">Error AI API: ' + err.message + '</span>';
            });
        }

        var lastLoaderRun = 0;
        window.runAiLoader = function() {
            var now = Date.now();
            if (now - lastLoaderRun < 10000) {
                if (typeof showToast === 'function') showToast("Please wait 10 seconds before running the AI Loader again.", "error");
                return;
            }
            lastLoaderRun = now;

            var csInterface = new CSInterface();
            var appName = csInterface.getHostEnvironment().appName;
            var storageKey = 'motionreis_ai_config_' + appName;
            var saved = window.ai_getSavedConfig ? window.ai_getSavedConfig() : localStorage.getItem(storageKey);
            
            if (!saved) {
                if (typeof showToast === 'function') showToast("Please save an AI configuration first!", "error");
                return;
            }
            var config = JSON.parse(saved);
            var btn = document.getElementById('btn-run-loader');
            var statusEl = document.getElementById('loader-status');
            var origBtnHtml = btn.innerHTML;
            
            function setStatus(msg) {
                if(statusEl) {
                    statusEl.style.display = 'block';
                    statusEl.innerText = msg;
                }
            }
            
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-rounded">sync</span> Processing...';
            
            setStatus("Scanning project folders...");
            
            Bridge.loadJSX('pipeline.jsx').then(function() {
                Bridge.callMethod('pipeline', 'prGetFolderFootage', {}).then(function(resStr) {
                    var res = (typeof resStr === 'string') ? JSON.parse(resStr) : resStr;
                    if (res && res.error) {
                        btn.disabled = false;
                        btn.innerHTML = origBtnHtml;
                        if (typeof showToast === 'function') showToast(res.error, "error");
                        if(statusEl) statusEl.style.display = 'none';
                        return;
                    }
                    
                    var groupedFootage = res.data || res; 
                    if (!groupedFootage || Object.keys(groupedFootage).length === 0) {
                        btn.disabled = false;
                        btn.innerHTML = origBtnHtml;
                        if (typeof showToast === 'function') showToast("No suitable folders or footage found in the project.", "error");
                        if(statusEl) statusEl.style.display = 'none';
                        return;
                    }
                    
                    var folderNames = Object.keys(groupedFootage);
                    
                    setStatus("Asking " + config.platform + " to parse folder names...");
                    
                    var prompt = "You are an assistant parsing Premiere Pro folder paths into clean Timeline Marker labels. Given an array of folder paths, generate a concise, logical marker label for each (e.g., from 'Project/DAY 01_CAM A' generate 'DAY 01 CAM A'). Return ONLY a valid JSON object where keys are the exact paths provided and values are the generated labels. Do not use markdown backticks.\n\nFolders:\n" + JSON.stringify(folderNames);
                    
                    var apiCall;
                    var key = window.ai_deobfuscate ? window.ai_deobfuscate(config.key) : (function() { try { return atob(config.key).split('').reverse().join(''); } catch(e) { return ''; } })();
                    
                    if (config.platform === 'gemini') {
                        apiCall = fetch('https://generativelanguage.googleapis.com/v1beta/models/' + config.model + ':generateContent?key=' + key, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: prompt }] }]
                            })
                        }).then(function(r) { return r.json(); }).then(function(d) {
                            if (d.error) throw new Error(d.error.message || "Gemini API Error");
                            if (d.candidates && d.candidates.length > 0) {
                                if (d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts.length > 0) {
                                    var text = d.candidates[0].content.parts[0].text;
                                    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                                    return JSON.parse(text);
                                } else if (d.candidates[0].finishReason) {
                                    throw new Error("Gemini blocked response: " + d.candidates[0].finishReason);
                                }
                            }
                            throw new Error("Invalid response from Gemini");
                        });
                    } else if (config.platform === 'openai' || config.platform === 'deepseek') {
                        var endpoint = config.platform === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.deepseek.com/chat/completions';
                        apiCall = fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
                            body: JSON.stringify({
                                model: config.model,
                                messages: [{role: "user", content: prompt}],
                                response_format: { type: "json_object" }
                            })
                        }).then(function(r) { return r.json(); }).then(function(d) {
                            if (d.error) throw new Error(d.error.message || "API Error");
                            if (d.choices && d.choices.length > 0 && d.choices[0].message && d.choices[0].message.content) {
                                return JSON.parse(d.choices[0].message.content);
                            }
                            throw new Error("Invalid response");
                        });
                    } else {
                        apiCall = Promise.reject(new Error("Platform " + config.platform + " not supported for Loader yet."));
                    }
                    
                    apiCall.then(function(labelsObj) {
                        setStatus("Building sequence...");
                        var addMarkers = document.getElementById('loader-add-markers').checked;
                        
                        Bridge.callMethod('pipeline', 'prBuildAISequence', { 
                            groupedFootage: groupedFootage, 
                            labels: labelsObj,
                            addMarkers: addMarkers
                        }).then(function(seqResStr) {
                            var seqRes = (typeof seqResStr === 'string') ? JSON.parse(seqResStr) : seqResStr;
                            btn.disabled = false;
                            btn.innerHTML = origBtnHtml;
                            if(statusEl) statusEl.style.display = 'none';
                            if (seqRes && seqRes.error) {
                                if (typeof showToast === 'function') showToast(seqRes.error, "error");
                            } else {
                                if (typeof showToast === 'function') showToast("Sequence successfully built!", "success");
                            }
                        }).catch(function(e) {
                            btn.disabled = false;
                            btn.innerHTML = origBtnHtml;
                            if (typeof showToast === 'function') showToast(e.message || e, "error");
                            if(statusEl) statusEl.style.display = 'none';
                        });
                        
                    }).catch(function(e) {
                        btn.disabled = false;
                        btn.innerHTML = origBtnHtml;
                        if (typeof showToast === 'function') showToast("AI Error: " + e.message, "error");
                        if(statusEl) statusEl.style.display = 'none';
                    });
                    
                }).catch(function(err) {
                    btn.disabled = false;
                    btn.innerHTML = origBtnHtml;
                    if (typeof showToast === 'function') showToast(err.message || err, "error");
                    if(statusEl) statusEl.style.display = 'none';
                });
            });
        };

        window.sendChatMessage = function() {
            try {
                var inputEl = document.getElementById('chat-input');
                var btnEl = document.getElementById('btn-send-chat');
                var statusContainerEl = document.getElementById('command-status');
                var statusTextEl = document.getElementById('command-status-text');
                
                var msg = inputEl.value.trim();
                if (!msg) return;
                
                var saved = window.ai_getSavedConfig ? window.ai_getSavedConfig() : null;
                if (!saved) {
                    if (typeof showToast === 'function') showToast("Please configure AI settings in AI Loader tab first.", "error");
                    return;
                }
                var config = JSON.parse(saved);
                var key = window.ai_deobfuscate ? window.ai_deobfuscate(config.key) : '';
                if (!key) {
                    if (typeof showToast === 'function') showToast("API Key is missing.", "error");
                    return;
                }
                
                var model = config.model || '';
                if (model.toLowerCase().indexOf('gemma') !== -1 || model.toLowerCase().indexOf('nano') !== -1) {
                    if (typeof showToast === 'function') showToast("Model " + model + " tidak mendukung function calling.", "error");
                    return;
                }
                
                inputEl.disabled = true;
                btnEl.disabled = true;
                btnEl.innerHTML = '<span class="material-symbols-rounded">sync</span> Processing...';
                statusContainerEl.style.display = 'block';
                statusTextEl.innerText = "Thinking...";
                statusTextEl.style.color = "var(--text-secondary)";
                
                var csInt = new CSInterface();
                var fsObj = require('fs');
                var pathObj = require('path');
                var pluginRoot = csInt.getSystemPath(SystemPath.EXTENSION);
                var panduanPath = pathObj.join(pluginRoot, 'panduan_fungsi.md');
                var sysText = "ExtendScript dev in Premiere Pro CEP panel. Target app.project.activeSequence.";
                try {
                    if (fsObj.existsSync(panduanPath)) {
                        sysText += "\n\n--- API REFERENCE ---\n" + fsObj.readFileSync(panduanPath, 'utf8');
                    }
                } catch(e) {}
                
                sysText += "\n\nCRITICAL INSTRUCTION: You must fulfill the user's request by calling the prExecuteScript tool. Write valid JavaScript for Premiere Pro ExtendScript. NEVER output conversational text. NEVER ask for confirmation. Execute the script immediately. ALWAYS make the script return a descriptive string summarizing what was changed (e.g., 'return \"Deleted \" + count + \" clips\";'). If nothing matches the criteria, return '0 items modified'.";

                var fetchUrl = '';
                var fetchHeaders = { 'Content-Type': 'application/json' };
                var fetchPayload = {};
                
                if (config.platform === 'gemini') {
                    fetchUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' + config.model + ':generateContent?key=' + key;
                    fetchPayload = {
                        system_instruction: { parts: [{ text: sysText }] },
                        contents: [{ role: "user", parts: [{ text: msg }] }],
                        tools: [{
                            functionDeclarations: [{
                                name: "prExecuteScript",
                                description: "Executes arbitrary ExtendScript code in Adobe Premiere Pro.",
                                parameters: { type: "OBJECT", properties: { code: { type: "STRING" } }, required: ["code"] }
                            }]
                        }],
                        tool_config: { function_calling_config: { mode: "ANY", allowed_function_names: ["prExecuteScript"] } }
                    };
                } else if (config.platform === 'anthropic') {
                    fetchUrl = 'https://api.anthropic.com/v1/messages';
                    fetchHeaders['x-api-key'] = key;
                    fetchHeaders['anthropic-version'] = '2023-06-01';
                    fetchHeaders['anthropic-dangerous-direct-browser-access'] = 'true';
                    fetchPayload = {
                        model: config.model,
                        max_tokens: 1024,
                        system: sysText,
                        messages: [{ role: "user", content: msg }],
                        tools: [{
                            name: "prExecuteScript",
                            description: "Executes arbitrary ExtendScript code in Adobe Premiere Pro.",
                            input_schema: { type: "object", properties: { code: { type: "string" } }, required: ["code"] }
                        }],
                        tool_choice: { type: "tool", name: "prExecuteScript" }
                    };
                } else { // OpenAI & DeepSeek
                    fetchUrl = config.platform === 'deepseek' ? 'https://api.deepseek.com/chat/completions' : 'https://api.openai.com/v1/chat/completions';
                    fetchHeaders['Authorization'] = 'Bearer ' + key;
                    fetchPayload = {
                        model: config.model,
                        messages: [
                            { role: "system", content: sysText },
                            { role: "user", content: msg }
                        ],
                        tools: [{
                            type: "function",
                            function: {
                                name: "prExecuteScript",
                                description: "Executes arbitrary ExtendScript code in Adobe Premiere Pro.",
                                parameters: { type: "object", properties: { code: { type: "string" } }, required: ["code"] }
                            }
                        }],
                        tool_choice: { type: "function", function: { name: "prExecuteScript" } }
                    };
                }
                
                function resetUI() {
                    if(inputEl) { inputEl.value = ''; inputEl.disabled = false; inputEl.focus(); }
                    if(btnEl) { btnEl.disabled = false; btnEl.innerHTML = '<span class="material-symbols-rounded">auto_awesome</span> Execute Command'; }
                    setTimeout(function() { if(statusContainerEl) statusContainerEl.style.display = 'none'; }, 10000);
                }
                
                fetch(fetchUrl, {
                    method: 'POST',
                    headers: fetchHeaders,
                    body: JSON.stringify(fetchPayload)
                }).then(function(r) { return r.json(); }).then(function(d) {
                    if (d.error) throw new Error(d.error.message || "API Error");
                    
                    var funcName = null;
                    var argsStr = null;
                    var textFallback = null;
                    
                    if (config.platform === 'gemini') {
                        if (d.candidates && d.candidates.length > 0) {
                            var parts = d.candidates[0].content.parts;
                            for (var i = 0; i < parts.length; i++) {
                                if (parts[i].functionCall) {
                                    funcName = parts[i].functionCall.name;
                                    argsStr = JSON.stringify(parts[i].functionCall.args);
                                    break;
                                }
                                if (parts[i].text) textFallback = parts[i].text;
                            }
                        }
                    } else if (config.platform === 'anthropic') {
                        if (d.content) {
                            for (var i = 0; i < d.content.length; i++) {
                                if (d.content[i].type === 'tool_use') {
                                    funcName = d.content[i].name;
                                    argsStr = JSON.stringify(d.content[i].input);
                                    break;
                                }
                                if (d.content[i].type === 'text') textFallback = d.content[i].text;
                            }
                        }
                    } else { // OpenAI / DeepSeek
                        if (d.choices && d.choices.length > 0) {
                            var msgObj = d.choices[0].message;
                            if (msgObj.tool_calls && msgObj.tool_calls.length > 0) {
                                funcName = msgObj.tool_calls[0].function.name;
                                argsStr = msgObj.tool_calls[0].function.arguments; // Already string
                            } else if (msgObj.content) {
                                textFallback = msgObj.content;
                            }
                        }
                    }
                    
                    if (funcName) {
                        statusTextEl.innerText = "Executing " + funcName + "...";
                        Bridge.loadJSX('pipeline.jsx').then(function() {
                            var parsedArgs = {};
                            try { parsedArgs = JSON.parse(argsStr); } catch(e) { parsedArgs = {code: argsStr}; }
                            
                            Bridge.callMethod('pipeline', funcName, parsedArgs).then(function(res) {
                                var resObj = typeof res === 'string' ? JSON.parse(res) : res;
                                if (resObj && resObj.error) {
                                    statusTextEl.innerText = "Error: " + resObj.error;
                                    statusTextEl.style.color = "var(--accent-danger, #ef4444)";
                                } else {
                                    statusTextEl.innerText = "Sukses! " + (resObj.message || "Tugas selesai.");
                                    statusTextEl.style.color = "var(--accent-primary)";
                                    if (typeof showToast === 'function') showToast(statusTextEl.innerText, "success");
                                }
                                resetUI();
                            }).catch(function(e) {
                                statusTextEl.innerText = "Execute Error: " + e.message;
                                statusTextEl.style.color = "var(--accent-danger, #ef4444)";
                                resetUI();
                            });
                        });
                    } else if (textFallback) {
                        var codeMatch = textFallback.match(/```(?:javascript|js)\n([\s\S]*?)```/);
                        if (codeMatch && codeMatch[1]) {
                            statusTextEl.innerText = "Executing (extracted from text)...";
                            Bridge.loadJSX('pipeline.jsx').then(function() {
                                Bridge.callMethod('pipeline', 'prExecuteScript', { code: codeMatch[1] }).then(function(res) {
                                    var resObj = typeof res === 'string' ? JSON.parse(res) : res;
                                    if (resObj && resObj.error) {
                                        statusTextEl.innerText = "Error: " + resObj.error;
                                        statusTextEl.style.color = "var(--accent-danger, #ef4444)";
                                    } else {
                                        statusTextEl.innerText = "Sukses! (Auto-fixed text response)";
                                        statusTextEl.style.color = "var(--accent-primary)";
                                    }
                                    setTimeout(resetUI, 3000);
                                }).catch(function(e) {
                                    statusTextEl.innerText = "Execute Error: " + e.message;
                                    statusTextEl.style.color = "var(--accent-danger, #ef4444)";
                                    setTimeout(resetUI, 3000);
                                });
                            });
                        } else {
                            statusTextEl.innerText = textFallback;
                            statusTextEl.style.color = "var(--text-primary)";
                            resetUI();
                        }
                    } else {
                        throw new Error("No valid response from AI.");
                    }
                }).catch(function(e) {
                    statusTextEl.innerText = "Network/API Error: " + e.message;
                    statusTextEl.style.color = "var(--accent-danger, #ef4444)";
                    resetUI();
                });
            } catch(fatalErr) {
                if (typeof showToast === 'function') showToast("Sync Error: " + fatalErr.message, "error");
                var btn = document.getElementById('btn-send-chat');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<span class="material-symbols-rounded">auto_awesome</span> Execute Command';
                }
                var inp = document.getElementById('chat-input');
                if (inp) { inp.disabled = false; inp.value = ''; }
                var stat = document.getElementById('command-status');
                if (stat) stat.style.display = 'none';
            }
        };

        // ── Expression Library (File System) ───────────────────────────
        var EXPR_LIB_FILE = path.join(EASE_LIB_DIR, 'expr_presets.json');

        function getExprLibrary() {
            var defaultExpr = [];
            try {
                if (!fs.existsSync(EASE_LIB_DIR)) fs.mkdirSync(EASE_LIB_DIR, {recursive: true});
                if (!fs.existsSync(EXPR_LIB_FILE)) {
                    fs.writeFileSync(EXPR_LIB_FILE, JSON.stringify(defaultExpr, null, 2), 'utf8');
                    return defaultExpr;
                }
                var lib = JSON.parse(fs.readFileSync(EXPR_LIB_FILE, 'utf8'));
                return lib;
            } catch(e) { return defaultExpr; }
        }

        function saveExprLibrary(lib) {
            try {
                if (!fs.existsSync(EASE_LIB_DIR)) fs.mkdirSync(EASE_LIB_DIR, {recursive: true});
                fs.writeFileSync(EXPR_LIB_FILE, JSON.stringify(lib, null, 2), 'utf8');
            } catch(e) { alert('Error saving expression: ' + e); }
        }

        function renderExprLibrary() {
            var lib = getExprLibrary();
            var select = document.getElementById('expr-lib-select');
            if(!select) return;
            select.innerHTML = '<option value="">Saved...</option>';
            lib.forEach(function(p) {
                var opt = document.createElement('option');
                opt.value = p.code;
                opt.innerText = p.name;
                select.appendChild(opt);
            });
        }

        function saveExprPreset() {
            var code = document.getElementById('ideInput').value.trim();
            if (!code) { showToast("Please write the expression code first!", "error"); return; }
            
            openTextPrompt("Save Expression", "Enter a name for this custom expression snippet:", function(name) {
                var lib = getExprLibrary();
                lib.push({ id: Date.now(), name: name, code: code });
                saveExprLibrary(lib);
                renderExprLibrary();
                showToast("Expression successfully saved to library!", "success");
            });
        }

        // Context-Aware Polling
        var contextPoller;
        function startContextPolling() {
            if (contextPoller) clearInterval(contextPoller);
            contextPoller = setInterval(function() {
                Bridge.eval('MotionreisUtils.getContext()').then(function(res) {
                    var activeCompEl = document.getElementById('active-comp-name');
                    if (!res || !res.valid) {
                        if (activeCompEl) activeCompEl.innerText = '[No Comp Selected]';
                        return;
                    }
                    var pinBtn = document.getElementById('pin-comp-btn');
                    var isPinned = pinBtn && pinBtn.classList.contains('pinned');

                    if (!isPinned) {
                        if (activeCompEl) {
                            activeCompEl.innerText = res.compName || '[Unknown]';
                        }
                        var outputNameInput = document.getElementById('render-output-name');
                        if (outputNameInput && res.compName) {
                            outputNameInput.placeholder = res.compName;
                        }
                    }
                    
                    // Example Context-Aware Logic: Highlight Audio Reactive if audio layer selected
                    var audioCard = document.getElementById('card-audioreactive'); // Audio Reactive is 2nd card in scene, wait it's the 2nd card (nth-child(3) because of header)
                    if (audioCard) {
                        if (res.types.audio) {
                            audioCard.style.borderColor = 'var(--accent-primary)';
                            audioCard.style.boxShadow = '0 0 8px rgba(99,102,241,0.2)';
                        } else {
                            audioCard.style.borderColor = 'var(--border-strong)';
                            audioCard.style.boxShadow = 'none';
                        }
                    }

                    // Highlight Text Animations if text layer selected
                    var textCard = document.querySelector('#mod-design .card:nth-child(2)');
                    if (textCard) {
                        if (res.types.text) {
                            textCard.style.borderColor = 'var(--accent-primary)';
                            textCard.style.boxShadow = '0 0 8px rgba(99,102,241,0.2)';
                        } else {
                            textCard.style.borderColor = 'var(--border-strong)';
                            textCard.style.boxShadow = 'none';
                        }
                    }
                }).catch(function(e){ /* ignore eval errors during poll */ });
            }, 500);
        }

        // Transition Shifter helper
        function execTS(target) {
            exec('motion', 'staggerTransitions', {
                frames: document.getElementById('ts-frames').value,
                mode:   document.getElementById('ts-mode').value,
                target: target
            });
        }

        // Folder Picker Helper using ExtendScript dialog
        function selectRenderFolder() {
            Bridge.eval('var f = Folder.selectDialog("Select Output Folder"); f ? f.fsName : ""').then(function(folderPath) {
                if (folderPath) {
                    document.getElementById('render-path').value = folderPath;
                }
            }).catch(function(err) {
                console.error("Folder picker failed:", err);
            });
        }

        // Render V2 High-Performance Engine
        var activeRenderProcesses = []; // Keep track of processes to kill them if needed
        var renderWatchdogs = [];       // Watchdog timers
        var { spawn } = require('child_process');

        function killAllActiveRenders() {
            activeRenderProcesses.forEachfunction(proc ) {
                try { proc.kill(); } catch(e) {}
            });
            activeRenderProcesses = [];
            renderWatchdogs.forEachfunction(w ) { return clearInterval(w; }));
            renderWatchdogs = [];
            
            document.getElementById('aerender-status').innerText = 'Render Canceled.';
            document.getElementById('aerender-progress-bar').style.background = 'var(--accent-danger)';
        }

        function startRenderV2() {
            // Check if project path is saved
            Bridge.eval('app.project.file ? app.project.file.fsName : ""').thenfunction(projPath ) {
                if (!projPath) {
                    showToast("Please save your project first (File > Save) before CLI Rendering!", "error");
                    return;
                }
                
                // Show Progress elements
                document.getElementById('aerender-status').style.display = 'block';
                document.getElementById('aerender-status').innerText = 'Initializing Pipeline...';
                document.getElementById('aerender-progress-bg').style.display = 'block';
                document.getElementById('aerender-progress-bar').style.width = '0%';
                document.getElementById('aerender-progress-bar').style.background = 'var(--accent-primary)';
                document.getElementById('aerender-recent-file').style.display = 'none';
                
                // 1. Gather UI Inputs
                var activeCompText = document.getElementById('active-comp-name').innerText;
                var renderSettings = document.getElementById('render-settings-select').value;
                var codec = document.getElementById('render-codec-select').value;
                var outputPath = document.getElementById('render-path').value;
                
                var timeRangeInput = document.querySelector('input[name="render_range"]:checked');
                var timeRange = timeRangeInput ? timeRangeInput.value : 'workarea';
                
                var saveNextToAEP = document.getElementById('render-save-next').checked;
                var autoVersion = document.getElementById('render-auto-version').checked;
                var autoSave = document.getElementById('render-auto-save').checked;
                var throttle = document.getElementById('render-throttle').value;
                var postAction = document.getElementById('render-postaction').value;
                
                // Setup custom name or fallback to comp name
                var outputName = document.getElementById('render-output-name').value.trim();
                if (!outputName || outputName === "Waiting for comp...") {
                    outputName = ""; // JSX will fallback to activeComp name
                }
                
                // Write temp config JSON file
                var pluginRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
                var configPath = path.join(pluginRoot, 'data', 'temp_render_config.json');
                
                var configData = {
                    compName: activeCompText,
                    renderSettings: renderSettings,
                    codec: codec,
                    outputPath: outputPath,
                    timeRange: timeRange,
                    saveNextToAEP: saveNextToAEP,
                    autoVersion: autoVersion,
                    autoSave: autoSave,
                    outputName: outputName
                };
                
                // Ensure data folder exists
                var dataFolder = path.join(pluginRoot, 'data');
                if (!fs.existsSync(dataFolder)) {
                    fs.mkdirSync(dataFolder, { recursive: true });
                }
                
                fs.writeFileSync(configPath, JSON.stringify(configData, null, 4));
                // Escape path for ExtendScript (backslashes on Windows)
                var escapedConfigPath = configPath.replace(/\\/g, '/');
                
                // 2. Call ExtendScript to prepare Render Queue & AEP file
                document.getElementById('aerender-status').innerText = 'Preparing Composition & Saving AEP...';
                
                csInterface.evalScript(`MotionreisUtils.prepCLIRender('${escapedConfigPath}')`, function(resStr) {
                    try {
                        var res = JSON.parse(resStr);
                        if (res.error) {
                            document.getElementById('aerender-status').innerText = 'Error: ' + res.error;
                            document.getElementById('aerender-progress-bar').style.background = 'var(--accent-danger)';
                            return;
                        }
                        
                        // Queue prepared successfully! We now run native MFR render.
                        runNativeMFR(res, throttle, postAction);
                        
                    } catch(err) {
                        document.getElementById('aerender-status').innerText = 'ExtendScript Error: ' + err.message;
                        document.getElementById('aerender-progress-bar').style.background = 'var(--accent-danger)';
                    }
                });
            });
        }

        function runNativeMFR(renderInfo, throttle, postAction) {
            var projectPath = renderInfo.projectPath;
            
            // Kill any existing processes first
            killAllActiveRenders();
            
            // Resolve aerender path
            var appPath = csInterface.getSystemPath(SystemPath.HOST_APPLICATION);
            var aerenderPath = '';
            var isMac = os.platform() === 'darwin';
            if (isMac) {
                var baseDir = appPath.substring(0, appPath.indexOf('.app/'));
                aerenderPath = path.join(path.dirname(baseDir + '.app'), 'aerender');
            } else {
                aerenderPath = path.join(path.dirname(appPath), 'aerender.exe');
            }
            
            if (!fs.existsSync(aerenderPath)) {
                document.getElementById('aerender-status').innerText = 'Error: aerender not found at ' + aerenderPath;
                document.getElementById('aerender-progress-bar').style.background = 'var(--accent-danger)';
                return;
            }
            
            // Setup MFR flag
            var mfrFlag = 'ON';
            var mfrPercent = '80'; // Balanced (Standard Allocation)
            if (throttle === 'slow') {
                mfrFlag = 'OFF';
            } else if (throttle === 'max') {
                mfrFlag = 'ON';
                mfrPercent = '100';
            }
            
            // CRITICAL: NO -reuse flag used. Spawn completely isolated!
            var args = [
                '-project', projectPath,
                '-continueOnMissingFootage'
            ];
            
            if (mfrFlag === 'ON') {
                args.push('-mfr', 'ON', mfrPercent);
            } else {
                args.push('-mfr', 'OFF');
            }
            
            document.getElementById('aerender-status').innerText = `Launching Native aerender CLI...`;
            
            var proc = spawn(aerenderPath, args);
            activeRenderProcesses.push(proc);
            
            var lastActivity = Date.now();
            var stderrLog = '';
            
            // Watchdog: kill if no stdout for 10 minutes (600,000 ms)
            var watchdog = setInterval(()function( ) {
                if (Date.now() - lastActivity > 600000) {
                    console.warn(`Watchdog: Render stuck (10m no output). Killing...`);
                    clearInterval(watchdog);
                    try { proc.kill('SIGKILL'); } catch(e) {}
                    activeRenderProcesses = activeRenderProcesses.filterfunction(p ) { return p !== proc; });
                    document.getElementById('aerender-status').innerText = 'Render killed by Watchdog (hang detected).';
                    document.getElementById('aerender-progress-bar').style.background = 'var(--accent-danger)';
                }
            }, 10000);
            
            renderWatchdogs.push(watchdog);
            
            var totalFrames = renderInfo.endFrame - renderInfo.startFrame + 1;
            
            proc.stdout.on('data', function(data) {
                lastActivity = Date.now();
                var output = data.toString();
                
                var lines = output.split('\n');
                lines.forEachfunction(line ) {
                    var frameMatch = line.match(/PROGRESS:.*frame\s+(\d+)/i) || line.match(/PROGRESS:.*\(\s*(\d+)\s*\)/i);
                    if (frameMatch) {
                        var framesDone = parseInt(frameMatch[1], 10);
                        var pct = Math.min(100, Math.floor((framesDone / totalFrames) * 100));
                        document.getElementById('aerender-progress-bar').style.width = pct + '%';
                        document.getElementById('aerender-status').innerText = `Rendering: ${pct}% (${framesDone}/${totalFrames} frames)`;
                    } else if (line.match(/PROGRESS:/i)) {
                         document.getElementById('aerender-status').innerText = line.trim();
                    }
                });
            });
            
            proc.stderr.on('data', function(data) {
                stderrLog += data.toString();
                lastActivity = Date.now();
            });
            
            proc.on('close', function(code) {
                clearInterval(watchdog);
                activeRenderProcesses = activeRenderProcesses.filterfunction(p ) { return p !== proc; });
                
                if (code !== 0 || stderrLog.toLowerCase().includes('error')) {
                    var errLines = stderrLog.split('\n').filterfunction(l ) { return l.trim(; }));
                    var lastErr = errLines.pop() || ('Exit code: ' + code);
                    document.getElementById('aerender-status').innerText = `Error: ${lastErr.trim().slice(0, 120)}`;
                    document.getElementById('aerender-progress-bar').style.background = 'var(--accent-danger)';
                    return;
                }
                
                finishRenderV2(path.join(renderInfo.finalDestDir, renderInfo.finalName), postAction);
            });
        }



        var lastRenderedFilePath = '';
        // ─── RENDER MODE PILL SWITCHER ─────────────────────────────────────────
        function switchRenderMode(mode) {
            var pillCli   = document.getElementById('pill-cli');
            var pillQueue = document.getElementById('pill-queue');
            var panelCli  = document.getElementById('render-panel-cli');
            var panelQueue= document.getElementById('render-panel-queue');

            if (mode === 'cli') {
                pillCli.style.background   = 'var(--accent-primary)';
                pillCli.style.color        = '#fff';
                pillQueue.style.background = 'transparent';
                pillQueue.style.color      = 'var(--text-secondary)';
                panelCli.style.display     = 'block';
                panelQueue.style.display   = 'none';
            } else {
                pillQueue.style.background = 'var(--accent-primary)';
                pillQueue.style.color      = '#fff';
                pillCli.style.background   = 'transparent';
                pillCli.style.color        = 'var(--text-secondary)';
                panelCli.style.display     = 'none';
                panelQueue.style.display   = 'block';
                rqRefresh();
            }
        }

        // ─── RENDER QUEUE PANEL FUNCTIONS ──────────────────────────────────────
        function rqRefresh() {
            csInterface.evalScript(`
                (function() {
                    try {
                        var rq = app.project.renderQueue;
                        var items = [];
                        for (var i = 1; i <= rq.numItems; i++) {
                            var item = rq.item(i);
                            var statusStr = 'Queued';
                            if (item.status === RQItemStatus.WILL_CONTINUE) statusStr = 'Will Continue';
                            else if (item.status === RQItemStatus.NEEDS_OUTPUT) statusStr = 'Needs Output';
                            else if (item.status === RQItemStatus.UNQUEUED) statusStr = 'Unqueued';
                            else if (item.status === RQItemStatus.QUEUED) statusStr = 'Queued';
                            else if (item.status === RQItemStatus.RENDERING) statusStr = 'Rendering';
                            else if (item.status === RQItemStatus.USER_STOPPED) statusStr = 'Stopped';
                            else if (item.status === RQItemStatus.ERR_STOPPED) statusStr = 'Error';
                            else if (item.status === RQItemStatus.DONE) statusStr = 'Done';

                            var om = item.outputModule(1);
                            var outFile = '';
                            try { outFile = om.file ? om.file.fsName : ''; } catch(e) {}

                            items.push({
                                index: i,
                                comp: item.comp.name,
                                status: statusStr,
                                outFile: outFile,
                                startTime: item.comp.workAreaStart ? item.comp.workAreaStart.toFixed(2) : '0',
                                duration: item.comp.workAreaDuration ? item.comp.workAreaDuration.toFixed(2) : '0'
                            });
                        }
                        return JSON.stringify({ ok: true, items: items });
                    } catch(e) {
                        return JSON.stringify({ ok: false, error: e.toString() });
                    }
                })()
            `, function(resStr) {
                try {
                    var res = JSON.parse(resStr);
                    var list = document.getElementById('rq-items-list');
                    var empty = document.getElementById('rq-empty-state');
                    
                    // Remove old items except empty state
                    var oldItems = list.querySelectorAll('.rq-item-row');
                    oldItems.forEach(function(el) { el.remove(); });
                    
                    if (!res.ok || !res.items || res.items.length === 0) {
                        empty.style.display = 'block';
                        return;
                    }
                    empty.style.display = 'none';
                    
                    res.items.forEach(function(item) {
                        var statusColor = 'var(--text-secondary)';
                        if (item.status === 'Done') statusColor = '#10b981';
                        else if (item.status === 'Queued') statusColor = 'var(--accent-primary)';
                        else if (item.status === 'Rendering') statusColor = '#f59e0b';
                        else if (item.status === 'Error' || item.status === 'Stopped') statusColor = '#ef4444';

                        var fileName = item.outFile ? item.outFile.split('/').pop().split('\\\\').pop() : 'No output set';
                        
                        var row = document.createElement('div');
                        row.className = 'rq-item-row';
                        row.style.cssText = 'background:var(--bg-app); border:1px solid var(--border-strong); border-radius:6px; padding:8px 10px; display:flex; align-items:center; gap:8px;';
                        row.innerHTML = `
                            <div style="flex:1; min-width:0;">
                                <div style="font-size:11px; font-weight:600; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.comp}</div>
                                <div style="font-size:9px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${fileName}</div>
                            </div>
                            <span style="font-size:9px; font-weight:700; color:${statusColor}; background:${statusColor}18; padding:2px 6px; border-radius:10px; white-space:nowrap;">${item.status}</span>
                            <button class="btn" style="padding:4px; justify-content:center; background:transparent; border:none; color:var(--text-secondary);" onclick="rqRemoveItem(${item.index})" title="Remove from Queue">
                                <span class="material-symbols-rounded" style="font-size:14px;">close</span>
                            </button>
                        `;
                        list.appendChild(row);
                    });
                } catch(e) {
                    console.error('rqRefresh error:', e);
                }
            });
        }

        function rqAddActiveComp() {
            csInterface.evalScript(`
                (function() {
                    try {
                        var comp = app.project.activeItem;
                        if (!comp || !(comp instanceof CompItem)) {
                            return JSON.stringify({ ok: false, error: 'No active composition. Please select a comp first.' });
                        }
                        app.project.renderQueue.items.add(comp);
                        return JSON.stringify({ ok: true, comp: comp.name });
                    } catch(e) {
                        return JSON.stringify({ ok: false, error: e.toString() });
                    }
                })()
            `, function(resStr) {
                try {
                    var res = JSON.parse(resStr);
                    if (!res.ok) {
                        showToast(res.error, 'error');
                    } else {
                        showToast(res.comp + ' added to Render Queue', 'success');
                        rqRefresh();
                    }
                } catch(e) {}
            });
        }

        function rqRemoveItem(index) {
            csInterface.evalScript(`
                (function() {
                    try {
                        app.project.renderQueue.item(${index}).remove();
                        return 'ok';
                    } catch(e) { return 'err:' + e.toString(); }
                })()
            `, function(res) {
                rqRefresh();
            });
        }

        function rqRenderAll() {
            csInterface.evalScript(`
                (function() {
                    try {
                        app.project.renderQueue.render();
                        return 'ok';
                    } catch(e) { return 'err:' + e.toString(); }
                })()
            `, function(res) {
                if (res && res.startsWith('err:')) {
                    showToast('Render failed: ' + res.replace('err:', ''), 'error');
                }
            });
        }

        // ─── RECENT FILE ───────────────────────────────────────────────────────
        function openRecentRender() {
            if (!lastRenderedFilePath) return;
            var { exec } = require('child_process');
            var isMac = require('os').platform() === 'darwin';
            var cmd = isMac ? `open -R "${lastRenderedFilePath}"` : `explorer.exe /select,"${lastRenderedFilePath}"`;
            exec(cmd);
        }

        function finishRenderV2(filePath, postAction) {
            document.getElementById('aerender-status').innerText = 'Render Complete!';
            document.getElementById('aerender-progress-bar').style.width = '100%';
            document.getElementById('aerender-progress-bar').style.background = '#10b981';
            
            lastRenderedFilePath = filePath;
            document.getElementById('aerender-recent-file').style.display = 'block';
            
            var isMac = os.platform() === 'darwin';
            if (postAction === 'chime') {
                if (isMac) {
                    var osascriptCmd = "osascript -e 'display notification \"Rendering Komposisi Resolusi Penuh Telah Selesai\" with title \"Antigravity Render Plugin\" subtitle \"Eksekusi Baris Komando Selesai\" sound name \"Glass\"'";
                    require('child_process').exec(osascriptCmd);
                } else {
                    require('child_process').spawn('powershell', ['-Command', '[console]::beep(1000, 500)']);
                    try {
                        var audio = new Audio('../../shared/chime.mp3');
                        audio.play();
                    } catch(e) {}
                }
            } else if (postAction === 'explorer') {
                var { exec } = require('child_process');
                var cmd = isMac ? `open -R "${filePath}"` : `explorer.exe /select,"${filePath}"`;
                exec(cmd);
            } else if (postAction === 'sleep') {
                var { exec } = require('child_process');
                var cmd = isMac ? `osascript -e 'tell application "System Events" to sleep'` : `rundll32.exe powrprof.dll,SetSuspendState 0,1,0`;
                exec(cmd);
            }
            
            showToast("Render Finished Successfully!", "success");
        }

        function deleteFolderRecursive(dirPath) {
            if (fs.existsSync(dirPath)) {
                fs.readdirSync(dirPath).forEach(function(file) {
                    var curPath = path.join(dirPath, file);
                    if (fs.lstatSync(curPath).isDirectory()) {
                        deleteFolderRecursive(curPath);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(dirPath);
            }
        }

        function openPluginBinFolder() {
            var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
            var binDir = path.join(extensionRoot, 'bin');
            if (!fs.existsSync(binDir)) {
                fs.mkdirSync(binDir, { recursive: true });
            }
            
            var isMac = os.platform() === 'darwin';
            var { exec } = require('child_process');
            var cmd = isMac ? `open "${binDir}"` : `explorer.exe "${binDir}"`;
            exec(cmd);
        }

        function checkFFmpegInstalled() {
            var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
            var isMac = os.platform() === 'darwin';
            var ffmpegPath = '';
            if (isMac) {
                ffmpegPath = path.join(extensionRoot, 'bin', 'mac', 'ffmpeg');
            } else {
                ffmpegPath = path.join(extensionRoot, 'bin', 'win', 'ffmpeg.exe');
            }
            
            var setupCard = document.getElementById('card-ffmpeg-setup');
            var renderBtn = document.querySelector('#card-clirender button');
            
            if (fs.existsSync(ffmpegPath)) {
                if (setupCard) setupCard.style.display = 'none';
                if (renderBtn) {
                    renderBtn.disabled = false;
                    renderBtn.style.opacity = '1';
                    renderBtn.innerHTML = `<span class="material-symbols-rounded" style="color:var(--accent-primary); margin-right:6px;">rocket_launch</span> START CLI RENDER`;
                }
            } else {
                if (setupCard) setupCard.style.display = 'block';
                if (renderBtn) {
                    renderBtn.disabled = true;
                    renderBtn.style.opacity = '0.5';
                    renderBtn.innerHTML = `<span class="material-symbols-rounded" style="margin-right:6px;">warning</span> FFmpeg Setup Required`;
                }
            }
        }

        function runFFmpegAutoInstall() {
            var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
            var isMac = os.platform() === 'darwin';
            var exec = require('child_process').exec;
            
            document.getElementById('ffmpeg-setup-status').style.display = 'block';
            document.getElementById('ffmpeg-setup-progress-bg').style.display = 'block';
            document.getElementById('ffmpeg-setup-progress-bar').style.width = '10%';
            document.getElementById('ffmpeg-setup-progress-bar').style.background = 'var(--accent-primary)';
            document.getElementById('ffmpeg-install-btn').disabled = true;
            document.getElementById('ffmpeg-install-btn').innerText = 'Downloading...';
            
            if (isMac) {
                var binDir = path.join(extensionRoot, 'bin', 'mac');
                if (!fs.existsSync(binDir)) {
                    fs.mkdirSync(binDir, { recursive: true });
                }
                
                var zipPath = path.join(binDir, 'ffmpeg.zip');
                document.getElementById('ffmpeg-setup-status').innerText = 'Downloading stable FFmpeg release ZIP...';
                document.getElementById('ffmpeg-setup-progress-bar').style.width = '40%';
                
                // Spawn curl in background to download Evermeet ZIP package
                var downloadCmd = `curl -L -o "${zipPath}" "https://evermeet.cx/ffmpeg/getrelease/zip"`;
                
                exec(downloadCmd, function(err, stdout, stderr) {
                    if (err) {
                        console.error("FFmpeg auto-download failed:", err);
                        document.getElementById('ffmpeg-setup-status').innerText = 'Error downloading. Please check internet connection.';
                        document.getElementById('ffmpeg-setup-progress-bar').style.background = 'var(--accent-danger)';
                        document.getElementById('ffmpeg-install-btn').disabled = false;
                        document.getElementById('ffmpeg-install-btn').innerText = '⚡ START AUTO-INSTALL';
                        return;
                    }
                    
                    document.getElementById('ffmpeg-setup-status').innerText = 'Extracting binary, cleaning archive...';
                    document.getElementById('ffmpeg-setup-progress-bar').style.width = '75%';
                    
                    // Unzip, delete zip, make executable
                    var extractCmd = `unzip -o "${zipPath}" -d "${binDir}" && rm "${zipPath}" && chmod +x "${binDir}/ffmpeg"`;
                    
                    exec(extractCmd, function(unzipErr, unzipStdout, unzipStderr) {
                        if (unzipErr) {
                            console.error("FFmpeg auto-extraction failed:", unzipErr);
                            document.getElementById('ffmpeg-setup-status').innerText = 'Error unzipping FFmpeg.';
                            document.getElementById('ffmpeg-setup-progress-bar').style.background = 'var(--accent-danger)';
                            document.getElementById('ffmpeg-install-btn').disabled = false;
                            document.getElementById('ffmpeg-install-btn').innerText = '⚡ START AUTO-INSTALL';
                            return;
                        }
                        
                        // Successfully configured FFmpeg!
                        document.getElementById('ffmpeg-setup-status').innerText = 'Auto-Setup complete!';
                        document.getElementById('ffmpeg-setup-progress-bar').style.width = '100%';
                        document.getElementById('ffmpeg-setup-progress-bar').style.background = '#10b981';
                        
                        showToast("FFmpeg parallel engine configured successfully!", "success");
                        setTimeout(()function( ) {
                            checkFFmpegInstalled();
                        }, 1200);
                    });
                });
            } else {
                // Windows Setup
                var binDir = path.join(extensionRoot, 'bin', 'win');
                if (!fs.existsSync(binDir)) {
                    fs.mkdirSync(binDir, { recursive: true });
                }
                
                var zipPath = path.join(binDir, 'ffmpeg.zip');
                document.getElementById('ffmpeg-setup-status').innerText = 'Downloading Windows FFmpeg build...';
                document.getElementById('ffmpeg-setup-progress-bar').style.width = '40%';
                
                // Windows PowerShell downloader command
                var downloadCmd = `powershell -Command "Invoke-WebRequest -Uri 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' -OutFile '${zipPath}'"`;
                
                exec(downloadCmd, function(err, stdout, stderr) {
                    if (err) {
                        console.error("FFmpeg Win download failed:", err);
                        document.getElementById('ffmpeg-setup-status').innerText = 'Error downloading Windows FFmpeg.';
                        document.getElementById('ffmpeg-setup-progress-bar').style.background = 'var(--accent-danger)';
                        document.getElementById('ffmpeg-install-btn').disabled = false;
                        document.getElementById('ffmpeg-install-btn').innerText = '⚡ START AUTO-INSTALL';
                        return;
                    }
                    
                    document.getElementById('ffmpeg-setup-status').innerText = 'Extracting essentials zip...';
                    document.getElementById('ffmpeg-setup-progress-bar').style.width = '75%';
                    
                    // Windows PowerShell extraction
                    var extractCmd = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${binDir}' -Force; Remove-Item '${zipPath}'"`;
                    
                    exec(extractCmd, function(unzipErr, unzipStdout, unzipStderr) {
                        if (unzipErr) {
                            console.error("FFmpeg Win extraction failed:", unzipErr);
                            document.getElementById('ffmpeg-setup-status').innerText = 'Extraction failed.';
                            document.getElementById('ffmpeg-setup-progress-bar').style.background = 'var(--accent-danger)';
                            document.getElementById('ffmpeg-install-btn').disabled = false;
                            document.getElementById('ffmpeg-install-btn').innerText = '⚡ START AUTO-INSTALL';
                            return;
                        }
                        
                        // Gyan.dev extract yields a nested directory with "bin/ffmpeg.exe". Let's locate it and move it to bin/win/ffmpeg.exe
                        try {
                            var dirs = fs.readdirSync(binDir);
                            var nestedDir = dirs.findfunction(d ) { return d.startsWith('ffmpeg-'; }) && fs.lstatSync(path.join(binDir, d)).isDirectory());
                            if (nestedDir) {
                                var nestedFF = path.join(binDir, nestedDir, 'bin', 'ffmpeg.exe');
                                if (fs.existsSync(nestedFF)) {
                                    fs.renameSync(nestedFF, path.join(binDir, 'ffmpeg.exe'));
                                    deleteFolderRecursive(path.join(binDir, nestedDir));
                                }
                            }
                        } catch(renameErr) {
                            console.error("Error moving Windows binary:", renameErr);
                        }
                        
                        document.getElementById('ffmpeg-setup-status').innerText = 'Auto-Setup complete!';
                        document.getElementById('ffmpeg-setup-progress-bar').style.width = '100%';
                        document.getElementById('ffmpeg-setup-progress-bar').style.background = '#10b981';
                        
                        showToast("FFmpeg parallel engine configured successfully!", "success");
                        setTimeout(()function( ) {
                            checkFFmpegInstalled();
                        }, 1200);
                    });
                });
            }
        }
        // ── SMART PANEL SYSTEM ──────────────────────────────────────────
        var CLICK_METRICS_FILE = path.join(EASE_LIB_DIR, 'click_metrics.json');
        window.SMART_PANEL_ENABLED = false;

        function updateSmartButtons() {
            // First, remove emphasis from all buttons
            var allButtons = document.querySelectorAll('.btn');
            allButtons.forEach(function(btn) {
                btn.classList.remove('smart-emphasis');
            });
            
            if (!window.SMART_PANEL_ENABLED) return;
            
            // Load metrics from disk
            var metrics = {};
            try {
                if (fs.existsSync(CLICK_METRICS_FILE)) {
                    metrics = JSON.parse(fs.readFileSync(CLICK_METRICS_FILE, 'utf8'));
                }
            } catch (e) {
                console.error("[Smart Panel] Error reading metrics:", e);
                return;
            }
            
            // Get top buttons
            var sortedActions = [];
            for (var key in metrics) {
                if (metrics.hasOwnProperty(key)) {
                    sortedActions.push({ key: key, count: metrics[key] });
                }
            }
            
            // Sort by count descending
            sortedActions.sort(function(a, b) {
                return b.count - a.count;
            });
            
            // Get top 5 with at least 3 clicks
            var topKeys = [];
            for (var i = 0; i < sortedActions.length; i++) {
                if (sortedActions[i].count >= 3) {
                    topKeys.push(sortedActions[i].key);
                }
                if (topKeys.length >= 5) break;
            }
            
            // Apply emphasis class to matching buttons
            allButtons.forEach(function(btn) {
                var onclick = btn.getAttribute('onclick');
                if (onclick) {
                    var actionKey = onclick.trim().replace(/\s+/g, ' ');
                    if (topKeys.indexOf(actionKey) !== -1) {
                        // Exclude apply/preset save/theme buttons explicitly as requested by user
                        var text = btn.innerText.toLowerCase();
                        if (text.indexOf('apply') === -1 && onclick.indexOf('setThemeColor') === -1) {
                            btn.classList.add('smart-emphasis');
                        }
                    }
                }
            });
        }

        function trackButtonClick(module, action, extraArgs) {
            try {
                if (!fs.existsSync(EASE_LIB_DIR)) fs.mkdirSync(EASE_LIB_DIR, { recursive: true });
                
                var metrics = {};
                if (fs.existsSync(CLICK_METRICS_FILE)) {
                    try {
                        metrics = JSON.parse(fs.readFileSync(CLICK_METRICS_FILE, 'utf8'));
                    } catch(e) {}
                }
                
                // Get unique key from clicked button onclick attribute
                var actionKey = null;
                if (window.event) {
                    var target = window.event.target;
                    while (target && target.tagName !== 'BUTTON') {
                        target = target.parentNode;
                    }
                    if (target && target.tagName === 'BUTTON' && target.getAttribute('onclick')) {
                        actionKey = target.getAttribute('onclick').trim().replace(/\s+/g, ' ');
                    }
                }
                
                // Fallback to legacy key if event target not resolved
                if (!actionKey) {
                    var type = (extraArgs && extraArgs.type) ? extraArgs.type : '';
                    actionKey = (action === 'createNewLayer' && type) ? (module + ':' + action + ':' + type) : (module + ':' + action);
                }
                
                metrics[actionKey] = (metrics[actionKey] || 0) + 1;
                
                fs.writeFileSync(CLICK_METRICS_FILE, JSON.stringify(metrics, null, 2), 'utf8');
                
                if (window.SMART_PANEL_ENABLED) {
                    updateSmartButtons();
                }
            } catch(e) {
                console.error("[Smart Panel] Error tracking click:", e);
            }
        }

        // ── USER PREFERENCES (LOCALSTORAGE) ──────────────────────────────

        function loadPreferences() {
            try {
                // Theme (Try persistent file cache first, fallback to localStorage)
                var savedTheme = null;
                try {
                    if (fs.existsSync(THEME_CONFIG_FILE)) {
                        var themeData = JSON.parse(fs.readFileSync(THEME_CONFIG_FILE, 'utf8'));
                        if (themeData && themeData.theme) {
                            savedTheme = themeData.theme;
                        }
                    }
                } catch(err) {
                    console.error("[Preferences] Failed to load theme file cache:", err);
                }

                if (!savedTheme) {
                    savedTheme = localStorage.getItem('motionreis_theme');
                }

                if (savedTheme) {
                    document.documentElement.style.setProperty('--accent-primary', savedTheme);
                    var customPicker = document.getElementById('custom-theme-picker');
                    if (customPicker) customPicker.value = savedTheme;
                    
                    // Keep localStorage synced
                    localStorage.setItem('motionreis_theme', savedTheme);
                } else {
                    document.documentElement.style.setProperty('--accent-primary', '#5160E3');
                    var customPicker = document.getElementById('custom-theme-picker');
                    if (customPicker) customPicker.value = '#5160E3';
                }

                // Speed Mode
                var savedSpeed = localStorage.getItem('motionreis_speed');
                if (savedSpeed === 'on') {
                    document.getElementById('toggle-speed-btn').classList.add('on');
                    document.getElementById('toggle-speed-btn').innerText = 'ON';
                    window.SPEED_MODE_ENABLED = true;
                } else {
                    document.getElementById('toggle-speed-btn').classList.remove('on');
                    document.getElementById('toggle-speed-btn').innerText = 'OFF';
                    window.SPEED_MODE_ENABLED = false;
                }

                // Smart Panel Mode
                var savedSmart = localStorage.getItem('motionreis_smart_panel');
                if (savedSmart === 'on' || savedSmart === null) {
                    var smartBtn = document.getElementById('toggle-smart-btn');
                    if (smartBtn) {
                        smartBtn.classList.add('on');
                        smartBtn.innerText = 'ON';
                    }
                    window.SMART_PANEL_ENABLED = true;
                    if (savedSmart === null) {
                        localStorage.setItem('motionreis_smart_panel', 'on');
                    }
                } else {
                    var smartBtn = document.getElementById('toggle-smart-btn');
                    if (smartBtn) {
                        smartBtn.classList.remove('on');
                        smartBtn.innerText = 'OFF';
                    }
                    window.SMART_PANEL_ENABLED = false;
                }
                updateSmartButtons();

                // Theme Icons Mode
                var savedThemeIcons = localStorage.getItem('motionreis_theme_icons');
                if (savedThemeIcons === 'on' || savedThemeIcons === null) {
                    var themeIconsBtn = document.getElementById('toggle-theme-icons-btn');
                    if (themeIconsBtn) {
                        themeIconsBtn.classList.add('on');
                        themeIconsBtn.innerText = 'ON';
                    }
                    document.body.classList.add('theme-icons');
                    if (savedThemeIcons === null) {
                        localStorage.setItem('motionreis_theme_icons', 'on');
                    }
                } else {
                    var themeIconsBtn = document.getElementById('toggle-theme-icons-btn');
                    if (themeIconsBtn) {
                        themeIconsBtn.classList.remove('on');
                        themeIconsBtn.innerText = 'OFF';
                    }
                    document.body.classList.remove('theme-icons');
                }
            } catch(e) {}
        }

        // Global var to track speed mode
        window.SPEED_MODE_ENABLED = false;

        function setThemeColor(hex) {
            document.documentElement.style.setProperty('--accent-primary', hex);
            localStorage.setItem('motionreis_theme', hex);
            
            // Persist to local JSON file so it never gets wiped by CEF/CSXS cache issues
            try {
                if (!fs.existsSync(EASE_LIB_DIR)) fs.mkdirSync(EASE_LIB_DIR, { recursive: true });
                fs.writeFileSync(THEME_CONFIG_FILE, JSON.stringify({ theme: hex }), 'utf8');
            } catch(e) {
                console.error("[Preferences] Failed to save theme file cache:", e);
            }
            
            showToast("Theme color updated", "success");
        }

        function toggleSpeedMode() {
            var btn = document.getElementById('toggle-speed-btn');
            if (btn.classList.contains('on')) {
                btn.classList.remove('on');
                btn.innerText = 'OFF';
                window.SPEED_MODE_ENABLED = false;
                localStorage.setItem('motionreis_speed', 'off');
                showToast("Speed Mode off", "success");
            } else {
                btn.classList.add('on');
                btn.innerText = 'ON';
                window.SPEED_MODE_ENABLED = true;
                localStorage.setItem('motionreis_speed', 'on');
                showToast("Speed Mode on", "success");
            }
        }

        function toggleSmartMode() {
            var btn = document.getElementById('toggle-smart-btn');
            if (btn.classList.contains('on')) {
                btn.classList.remove('on');
                btn.innerText = 'OFF';
                window.SMART_PANEL_ENABLED = false;
                localStorage.setItem('motionreis_smart_panel', 'off');
                showToast("Smart Panel disabled", "success");
            } else {
                btn.classList.add('on');
                btn.innerText = 'ON';
                window.SMART_PANEL_ENABLED = true;
                localStorage.setItem('motionreis_smart_panel', 'on');
                showToast("Smart Panel enabled", "success");
            }
            updateSmartButtons();
        }

        function toggleThemeIcons() {
            var btn = document.getElementById('toggle-theme-icons-btn');
            if (btn.classList.contains('on')) {
                btn.classList.remove('on');
                btn.innerText = 'OFF';
                localStorage.setItem('motionreis_theme_icons', 'off');
                document.body.classList.remove('theme-icons');
                showToast("Theme icons disabled", "success");
            } else {
                btn.classList.add('on');
                btn.innerText = 'ON';
                localStorage.setItem('motionreis_theme_icons', 'on');
                document.body.classList.add('theme-icons');
                showToast("Theme icons enabled", "success");
            }
        }

        function resetPreferences() {
            showConfirmModal("Reset Settings", "Are you sure you want to reset all preferences? This will not delete your library.", function() {
                localStorage.removeItem('motionreis_theme');
                localStorage.removeItem('motionreis_theme_icons');
                localStorage.removeItem('motionreis_speed');
                localStorage.removeItem('motionreis_smart_panel');
                localStorage.removeItem('dontAskOsOrganize');
                try {
                    if (fs.existsSync(THEME_CONFIG_FILE)) {
                        fs.unlinkSync(THEME_CONFIG_FILE);
                    }
                } catch(e) {}
                
                loadPreferences(); // Soft reset
                showToast("Settings reset to default.", "success");
            }, "Reset", "var(--accent-danger)");
        }

        function factoryReset() {
            showConfirmModal("Factory Reset", "Are you sure you want to completely reset? This will delete your library and preferences.", function() {
                try {
                    localStorage.clear();
                    if (fs.existsSync(EASE_LIB_FILE)) fs.unlinkSync(EASE_LIB_FILE);
                    if (fs.existsSync(CLICK_METRICS_FILE)) fs.unlinkSync(CLICK_METRICS_FILE);
                    try {
                        if (fs.existsSync(THEME_CONFIG_FILE)) {
                            fs.unlinkSync(THEME_CONFIG_FILE);
                        }
                    } catch(e) {}
                    
                    loadPreferences(); // Soft reset UI settings
                    
                    // Clear Ease Grid data
                    if (typeof loadEasePresets === 'function') {
                        // Just clear it directly on the DOM
                        var list = document.getElementById('ease-preset-list');
                        if (list) list.innerHTML = '';
                    }
                    
                    // Clear Metrics
                    var metricsCard = document.getElementById('card-metrics');
                    if (metricsCard) {
                        metricsCard.innerHTML = `<div class="section-label">Performance Metrics</div><p style="font-size:11px; color:var(--text-secondary); margin-bottom:0;">No data available yet.</p>`;
                    }
                    
                    showToast("Factory Reset Complete.", "success");
                } catch(e) { alert(e); }
            });
        }

        var pendingSyncTarget = "";
        
        function promptMoveDataFolder() {
            Bridge.eval('pipeline.selectGenericFolder()').then(function(resData) {
                if (resData === "Cancelled.") return;
                
                var basePath = resData.path;
                var targetPath = path.join(basePath, 'Motionreis SUITE');
                
                if (targetPath === EASE_LIB_DIR || basePath === EASE_LIB_DIR) {
                    showToast("Already using this directory.", "info");
                    return;
                }
                
                pendingSyncTarget = targetPath;
                var hasData = false;
                if (fs.existsSync(targetPath)) {
                    if (fs.existsSync(path.join(targetPath, 'ease_presets.json')) || fs.existsSync(path.join(targetPath, 'theme_config.json'))) {
                        hasData = true;
                    }
                }
                
                if (hasData) {
                    document.getElementById('sync-conflict-modal').style.display = 'flex';
                } else {
                    executeDataSyncDirectly(targetPath, "local", "local");
                }
            }).catch(function(err) {
                if (err.message && err.message !== "Cancelled.") showToast(err.message, 'error');
            });
        }
        
        function closeSyncConflictModal() {
            document.getElementById('sync-conflict-modal').style.display = 'none';
            pendingSyncTarget = "";
            window.isCloudSyncSetup = false;
        }
        
        function executeDataSync() {
            var settingsChoice = document.querySelector('input[name="sync_settings"]:checked').value;
            var dataChoice = document.querySelector('input[name="sync_data"]:checked').value;
            closeSyncConflictModal();
            if (window.isCloudSyncSetup) {
                executeCloudSyncDirectly(pendingSyncTarget, settingsChoice, dataChoice);
            } else {
                executeDataSyncDirectly(pendingSyncTarget, settingsChoice, dataChoice);
            }
        }
        
        function executeDataSyncDirectly(targetPath, settingsChoice, dataChoice) {
            try {
                if (!fs.existsSync(targetPath)) safeMkdirSync(targetPath);
                
                var dataFiles = ['ease_presets.json', 'expr_presets.json', 'home_widgets.json'];
                dataFiles.forEach(function(f) {
                    var localF = path.join(EASE_LIB_DIR, f);
                    var targetF = path.join(targetPath, f);
                    
                    if (dataChoice === "merge") {
                        var localData = [];
                        var targetData = [];
                        if (fs.existsSync(localF)) localData = JSON.parse(fs.readFileSync(localF, 'utf8'));
                        if (fs.existsSync(targetF)) targetData = JSON.parse(fs.readFileSync(targetF, 'utf8'));
                        
                        var merged = targetData.slice();
                        localData.forEachfunction(item ) {
                            var exists = merged.findfunction(m ) { return (m.id && item.id && m.id === item.id; }) || (m.name && item.name && m.name === item.name));
                            if (!exists) merged.push(item);
                        });
                        fs.writeFileSync(targetF, JSON.stringify(merged, null, 4));
                    } else if (dataChoice === "local") {
                        if (fs.existsSync(localF)) fs.copyFileSync(localF, targetF);
                    }
                });
                
                var settingsFiles = ['theme_config.json', 'recent_project_cache.json', 'click_metrics.json'];
                settingsFiles.forEach(function(f) {
                    var localF = path.join(EASE_LIB_DIR, f);
                    var targetF = path.join(targetPath, f);
                    
                    if (settingsChoice === "local") {
                        if (fs.existsSync(localF)) safeCopyFileSync(localF, targetF);
                    }
                });
                
                fs.writeFileSync(POINTER_FILE, targetPath, 'utf8');
                
                if (syncItemAe) {
                    syncAESettings(targetPath, settingsChoice, function() {
                        showToast("Data Sync Complete!", "success");
                    });
                } else {
                    showToast("Data Sync Complete!", "success");
                }
            } catch(e) {
                console.error(e);
                showToast("Sync Error: " + e.message, "error");
            }
        }

        function runDeepDuplicator() {
            var data = {
                fixCb: document.getElementById('dup-fix-cb').checked,
                fixType: document.getElementById('dup-fix-type').value,
                fixText: document.getElementById('dup-fix-text').value,
                
                replaceCb: document.getElementById('dup-replace-cb').checked,
                searchText: document.getElementById('dup-search-text').value,
                replaceText: document.getElementById('dup-replace-text').value,
                
                incCb: document.getElementById('dup-inc-cb').checked,
                incType: document.getElementById('dup-inc-type').value,
                
                colorCb: document.getElementById('dup-color-val').value !== "0",
                colorVal: parseInt(document.getElementById('dup-color-val').value),
                
                folderCb: document.getElementById('dup-folder-cb').checked,
                folderName: document.getElementById('dup-folder-name').value,
                
                excludeCb: document.getElementById('dup-exclude-cb').checked,
                excludeType: document.getElementById('dup-exclude-type').value,
                excludeText: document.getElementById('dup-exclude-text').value,
                
                depthCb: false, // Removed depth UI to keep it simpler, but keeping logic
                depthVal: 20,
                
                exprCb: document.getElementById('dup-expr-cb').checked,
                footageCb: document.getElementById('dup-footage-cb').checked,
                solidsCb: document.getElementById('dup-solids-cb').checked,
                selectCb: false,
                
                copies: parseInt(document.getElementById('dup-copies').value) || 1
            };
            exec('pipeline', 'deepDuplicate', data);
        }

        var pendingRelinkedItems = [];
        
        function triggerSmartRelinker() {
            var res = window.cep.fs.showOpenDialog(false, true, "Select a folder to search for offline assets", "", []);
            if (res.data && res.data.length > 0) {
                var folderPath = res.data[0];
                showToast("Scanning folder... this may take a moment.", "info");
                
                Bridge.eval(`pipeline.smartRelink("${folderPath.replace(/\\/g, '/')}")`).then(function(resData) {
                    if (resData && resData.startsWith('{')) {
                        var data = JSON.parse(resData);
                        if (data.count === 0) {
                            showToast("No missing assets found in project.", "info");
                        } else {
                            pendingRelinkedItems = data.items;
                            document.getElementById('smart-relink-count').innerText = data.count;
                            document.getElementById('smart-relink-org-modal').classList.add('show');
                        }
                    } else if (resData) {
                        showToast(resData, "error");
                    }
                }).catchfunction(e ) {
                    showToast("Error during relink", "error");
                });
            }
        }
        
        function closeSmartRelinkModal() {
            document.getElementById('smart-relink-org-modal').classList.remove('show');
        }
        
        function organizeRelinkedAssets(action) {
            closeSmartRelinkModal();
            
            Bridge.eval('app.project.file ? app.project.file.parent.fsName : ""').then(function(projPath) {
                if (!projPath) {
                    showToast("Please save your project first to use auto-sorting.", "warning");
                    return;
                }
                
                showToast("Organizing assets...", "info");
                var mappings = [];
                var movedCount = 0;
                
                for (var i = 0; i < pendingRelinkedItems.length; i++) {
                    var item = pendingRelinkedItems[i];
                    var ext = path.extname(item.path).toLowerCase();
                    var targetDir = '01_ASSET';
                    
                    if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) targetDir = '08_VIDEO DATA';
                    else if (['.png', '.jpg', '.jpeg', '.psd', '.ai', '.webp', '.tiff'].includes(ext)) targetDir = '04_IMAGE';
                    else if (['.wav', '.mp3', '.m4a', '.ogg', '.aac'].includes(ext)) targetDir = '02_AUDIO';
                    else if (['.obj', '.c4d', '.fbx'].includes(ext)) targetDir = '07_CG';
                    
                    var targetFolder = path.join(projPath, targetDir);
                    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, {recursive:true});
                    
                    var fileName = path.basename(item.path);
                    var newPath = path.join(targetFolder, fileName);
                    
                    try {
                        if (item.path !== newPath) {
                            if (action === 'move') {
                                fs.renameSync(item.path, newPath);
                            } else {
                                fs.copyFileSync(item.path, newPath);
                            }
                            mappings.push({ id: item.id, newPath: newPath.replace(/\\/g, '/') });
                            movedCount++;
                        }
                    } catch(err) {
                        console.error("Failed to move/copy", item.path, err);
                    }
                }
                
                if (mappings.length > 0) {
                    Bridge.eval(`pipeline.relinkToNewPaths('${JSON.stringify(mappings)}')`).then(function(relRes) {
                        showToast("Successfully organized " + movedCount + " assets!", "success");
                    });
                } else {
                    showToast("Assets are already in the correct folders.", "success");
                }
            });
        }

        // Initialize preferences on boot
        document.addEventListener('DOMContentLoaded', function() {
            loadPreferences();
            initBackupSettings();
            checkFFmpegInstalled();
        });

        // ── BACKUP SUITE JS ARCHITECTURE ───────────────────────────────
        var backupLoc1Path = localStorage.getItem('motionreis_backup_loc1_path') || path.join(os.homedir(), 'Documents', 'Motionreis_Backups');
        var backupLoc2Path = localStorage.getItem('motionreis_backup_loc2_path') || '';
        var backupLoc1Enable = localStorage.getItem('motionreis_backup_loc1_enable') !== 'false'; // default true
        var backupLoc2Enable = localStorage.getItem('motionreis_backup_loc2_enable') === 'true';   // default false
        
        var backupItemPref = localStorage.getItem('motionreis_backup_item_pref') !== 'false';     // default true
        var backupItemData = localStorage.getItem('motionreis_backup_item_data') !== 'false';     // default true
        var backupItemAe   = localStorage.getItem('motionreis_backup_item_ae') !== 'false';       // default true

        var liveSyncWatcher = null;
        var debounceSyncTimers = {};

        function startLiveSyncWatcher() {
            try {
                if (liveSyncWatcher) {
                    liveSyncWatcher.close();
                    liveSyncWatcher = null;
                }
                
                if (!fs.existsSync(EASE_LIB_DIR)) return;
                
                liveSyncWatcher = fs.watch(EASE_LIB_DIR, function(eventType, filename) {
                    if (!filename) return;
                    if (!filename.endsWith('.json')) return;
                    debounceSyncFile(filename);
                });
            } catch(e) { console.error("Error starting live sync watcher:", e); }
        }

        function debounceSyncFile(filename) {
            if (debounceSyncTimers[filename]) clearTimeout(debounceSyncTimers[filename]);
            
            debounceSyncTimers[filename] = setTimeout(function() {
                try {
                    var src = path.join(EASE_LIB_DIR, filename);
                    if (!fs.existsSync(src)) return;
                    
                    var targetDirs = [];
                    if (backupLoc1Enable && backupLoc1Path) targetDirs.push(path.join(backupLoc1Path, 'Live_Sync'));
                    if (backupLoc2Enable && backupLoc2Path) targetDirs.push(path.join(backupLoc2Path, 'Live_Sync'));
                    
                    targetDirs.forEachfunction(dir ) {
                        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                        fs.copyFileSync(src, path.join(dir, filename));
                    });
                    
                    if (filename === 'theme_config.json' || filename === 'click_metrics.json') {
                        targetDirs.forEachfunction(dir ) {
                            var lsDump = {};
                            for (var i = 0; i < localStorage.length; i++) {
                                var k = localStorage.key(i);
                                if (k.startsWith('motionreis_') || k === 'dontAskOsOrganize') {
                                    lsDump[k] = localStorage.getItem(k);
                                }
                            }
                            fs.writeFileSync(path.join(dir, 'localstorage_backup.json'), JSON.stringify(lsDump, null, 4), 'utf8');
                        });
                    }
                } catch(e) { console.error("Auto sync failed for", filename, e); }
            }, 1000); // 1-second debounce
        }

        function triggerManualSyncToLive() {
            try {
                if (!fs.existsSync(EASE_LIB_DIR)) return;
                var files = fs.readdirSync(EASE_LIB_DIR);
                files.forEachfunction(f ) {
                    if (f.endsWith('.json')) {
                        debounceSyncFile(f);
                    }
                });
            } catch(e) { console.error("Manual sync failed:", e); }
        }

        function initBackupSettings() {
            // Update Data Location displays on both Info and Backup panels
            var dispBackup = document.getElementById('data-location-display-backup');
            if (dispBackup) dispBackup.innerText = EASE_LIB_DIR;
            
            var dispInfo = document.getElementById('data-location-display');
            if (dispInfo) dispInfo.innerText = EASE_LIB_DIR;

            // Set inputs
            document.getElementById('backup-loc1-path').value = backupLoc1Path;
            document.getElementById('backup-loc2-path').value = backupLoc2Path || 'Not configured (Click folder to choose...)';

            // Set active states for location toggles
            updateToggleState('toggle-backup-loc1-btn', backupLoc1Enable);
            updateToggleState('toggle-backup-loc2-btn', backupLoc2Enable);

            // Set active states for backup items toggles
            updateToggleState('toggle-backup-item-pref-btn', backupItemPref);
            updateToggleState('toggle-backup-item-data-btn', backupItemData);
            updateToggleState('toggle-backup-item-ae-btn', backupItemAe);

            // Start auto sync watching
            startLiveSyncWatcher();
        }

        function updateToggleState(id, state) {
            var btn = document.getElementById(id);
            if (!btn) return;
            if (state) {
                btn.classList.add('on');
                btn.innerText = 'ON';
            } else {
                btn.classList.remove('on');
                btn.innerText = 'OFF';
            }
        }

        var CLOUD_PREFS_FILE = path.join(EASE_LIB_DIR, 'cloud_sync_prefs.json');
        
        var cloudSyncEnable = false;
        var cloudSyncPath = "";
        var syncItemPref = true;
        var syncItemData = true;
        var syncItemAe = true;
        var syncItemAep = true;

        try {
            if (fs.existsSync(CLOUD_PREFS_FILE)) {
                var prefs = JSON.parse(fs.readFileSync(CLOUD_PREFS_FILE, 'utf8'));
                if (prefs.cloudSyncEnable !== undefined) cloudSyncEnable = prefs.cloudSyncEnable;
                if (prefs.cloudSyncPath !== undefined) cloudSyncPath = prefs.cloudSyncPath;
                if (prefs.syncItemPref !== undefined) syncItemPref = prefs.syncItemPref;
                if (prefs.syncItemData !== undefined) syncItemData = prefs.syncItemData;
                if (prefs.syncItemAe !== undefined) syncItemAe = prefs.syncItemAe;
                if (prefs.syncItemAep !== undefined) syncItemAep = prefs.syncItemAep;
            }
        } catch(e) { console.error("Failed to load cloud prefs:", e); }

        function saveCloudPrefs() {
            try {
                fs.writeFileSync(CLOUD_PREFS_FILE, JSON.stringify({
                    cloudSyncEnable: cloudSyncEnable,
                    cloudSyncPath: cloudSyncPath,
                    syncItemPref: syncItemPref,
                    syncItemData: syncItemData,
                    syncItemAe: syncItemAe,
                    syncItemAep: syncItemAep
                }, null, 2), 'utf8');
            } catch(e) { console.error("Failed to save cloud prefs:", e); }
        }

        // Set initial toggle states on load
        (function initCloudSyncUI() {
            if (document.getElementById('cloud-sync-path')) {
                document.getElementById('cloud-sync-path').value = cloudSyncPath;
                updateToggleState('toggle-cloud-sync-btn', cloudSyncEnable);
                updateToggleState('toggle-sync-pref-btn', syncItemPref);
                updateToggleState('toggle-sync-data-btn', syncItemData);
                updateToggleState('toggle-sync-ae-btn', syncItemAe);
                if (document.getElementById('toggle-sync-aep-btn')) updateToggleState('toggle-sync-aep-btn', syncItemAep);
            }
        })();

        function toggleCloudSync() {
            if (!cloudSyncPath) {
                showToast("Please choose a cloud folder first!", "error");
                return;
            }
            cloudSyncEnable = !cloudSyncEnable;
            saveCloudPrefs();
            updateToggleState('toggle-cloud-sync-btn', cloudSyncEnable);
            showToast("Cloud Auto-Sync " + (cloudSyncEnable ? "enabled" : "disabled"), "info");
            if (cloudSyncEnable) triggerAutoSync();
        }

        function forcePushToCloud() {
            if (!cloudSyncPath || !fs.existsSync(cloudSyncPath)) {
                showToast("Cloud folder not found. Please set it up first.", "error");
                return;
            }
            showToast("Pushing data to cloud...", "info");
            if (syncItemAep) {
                backupCurrentAEP(false);
            }
            setTimeout(function() {
                executeCloudSyncDirectly(cloudSyncPath, "local", "local");
            }, 100);
        }

        function toggleSyncItem(type) {
            if (type === 'pref') {
                syncItemPref = !syncItemPref;
                saveCloudPrefs();
                updateToggleState('toggle-sync-pref-btn', syncItemPref);
            } else if (type === 'data') {
                syncItemData = !syncItemData;
                saveCloudPrefs();
                updateToggleState('toggle-sync-data-btn', syncItemData);
            } else if (type === 'ae') {
                syncItemAe = !syncItemAe;
                saveCloudPrefs();
                updateToggleState('toggle-sync-ae-btn', syncItemAe);
            } else if (type === 'aep') {
                syncItemAep = !syncItemAep;
                saveCloudPrefs();
                updateToggleState('toggle-sync-aep-btn', syncItemAep);
                if (syncItemAep) backupCurrentAEP(false);
            }
            showToast("Auto-Sync preferences updated", "info");
        }

        function backupCurrentAEP(isManual) {
            if (!cloudSyncEnable || !cloudSyncPath || !fs.existsSync(cloudSyncPath)) {
                if (isManual) showToast("Cloud folder not configured.", "error");
                return;
            }
            Bridge.eval('app.project.file ? app.project.file.fsName : ""').then(function(aepPath) {
                if (!aepPath || aepPath === "") {
                    if (isManual) showToast("Please save your project first.", "error");
                    return;
                }
                try {
                    var aepName = path.basename(aepPath);
                    var localAepFolder = path.join(EASE_LIB_DIR, "AEP_Backups");
                    if (!fs.existsSync(localAepFolder)) safeMkdirSync(localAepFolder);
                    var localAepPath = path.join(localAepFolder, aepName);
                    
                    safeCopyFileSync(aepPath, localAepPath);
                    
                    var tmpAepFolder = path.join(cloudSyncPath, "AEP_Backups");
                    if (!fs.existsSync(tmpAepFolder)) safeMkdirSync(tmpAepFolder);
                    var targetAepPath = path.join(tmpAepFolder, aepName);
                    
                    safeCopyFileSync(localAepPath, targetAepPath);
                    if (isManual) showToast("AEP Blueprint Backed Up!", "success");
                } catch(e) {
                    console.error("AEP Backup error", e);
                    if (isManual) showToast("Backup Failed: " + e.message, "error");
                }
            });
        }

        setInterval(function() {
            if (cloudSyncEnable && syncItemAep) backupCurrentAEP(false);
        }, 5 * 60 * 1000);

        function browseCloudSyncLocation() {
            Bridge.eval('pipeline.selectGenericFolder()').then(function(resData) {
                if (resData === "Cancelled.") return;
                
                var selectedPath = resData.path;
                var backupPath = path.join(selectedPath, 'Motionreis Backup');
                cloudSyncPath = backupPath;
                cloudSyncEnable = true;
                saveCloudPrefs();
                
                document.getElementById('cloud-sync-path').value = backupPath;
                updateToggleState('toggle-cloud-sync-btn', true);
                
                // Check if folder contains backup data
                pendingSyncTarget = backupPath;
                window.isCloudSyncSetup = true;
                
                var hasBackup = false;
                if (fs.existsSync(backupPath)) {
                    if (fs.existsSync(path.join(backupPath, 'ease_presets.json')) || fs.existsSync(path.join(backupPath, 'theme_config.json'))) {
                        hasBackup = true;
                    }
                }
                
                if (hasBackup) {
                    document.getElementById('sync-conflict-modal').style.display = 'flex';
                } else {
                    executeCloudSyncDirectly(backupPath, "local", "local");
                }
            }).catch(function(err) {
                if (err.message && err.message !== "Cancelled.") showToast(err.message, 'error');
            });
        }
        
        function executeCloudSyncDirectly(targetPath, settingsChoice, dataChoice) {
            try {
                var tmpPath = path.join(EASE_LIB_DIR, '.TMPbackup');
                if (fs.existsSync(tmpPath)) require('child_process').execSync('rm -rf "' + tmpPath + '"');
                safeMkdirSync(tmpPath);
                
                if (fs.existsSync(targetPath)) {
                    copyFolderRecursiveSync(targetPath, tmpPath);
                }
                
                var dataFiles = ['ease_presets.json', 'expr_presets.json', 'home_widgets.json'];
                dataFiles.forEach(function(f) {
                    var localF = path.join(EASE_LIB_DIR, f);
                    var targetF = path.join(tmpPath, f);
                    
                    if (dataChoice === "merge") {
                        var localData = []; var targetData = [];
                        if (fs.existsSync(localF)) localData = JSON.parse(fs.readFileSync(localF, 'utf8'));
                        if (fs.existsSync(targetF)) targetData = JSON.parse(fs.readFileSync(targetF, 'utf8'));
                        
                        var merged = targetData.slice();
                        localData.forEachfunction(item ) {
                            var exists = merged.findfunction(m ) { return (m.id && item.id && m.id === item.id; }) || (m.name && item.name && m.name === item.name));
                            if (!exists) merged.push(item);
                        });
                        fs.writeFileSync(localF, JSON.stringify(merged, null, 4), 'utf8');
                        fs.writeFileSync(targetF, JSON.stringify(merged, null, 4), 'utf8');
                    } else if (dataChoice === "local") {
                        if (fs.existsSync(localF)) fs.copyFileSync(localF, targetF);
                    } else if (dataChoice === "target") {
                        if (fs.existsSync(targetF)) fs.copyFileSync(targetF, localF);
                    }
                });
                
                var settingsFiles = ['theme_config.json', 'recent_project_cache.json', 'click_metrics.json'];
                settingsFiles.forEach(function(f) {
                    var localF = path.join(EASE_LIB_DIR, f);
                    var targetF = path.join(tmpPath, f);
                    if (settingsChoice === "local") {
                        if (fs.existsSync(localF)) fs.copyFileSync(localF, targetF);
                    } else if (settingsChoice === "target") {
                        if (fs.existsSync(targetF)) fs.copyFileSync(targetF, localF);
                    }
                });
                
                var deployTmpToCloud = function() {
                    try {
                        if (!fs.existsSync(targetPath)) {
                            safeMkdirSync(targetPath);
                        } else {
                            // Delete contents of targetPath, keep the root folder
                            var existingFiles = fs.readdirSync(targetPath);
                            for (var i = 0; i < existingFiles.length; i++) {
                                require('child_process').execSync('rm -rf "' + path.join(targetPath, existingFiles[i]) + '"');
                            }
                        }
                        
                        // Copy contents of tmpPath into targetPath
                        var tmpFiles = fs.readdirSync(tmpPath);
                        for (var i = 0; i < tmpFiles.length; i++) {
                            require('child_process').execSync('cp -R "' + path.join(tmpPath, tmpFiles[i]) + '" "' + targetPath + '/"');
                        }
                        
                        // Cleanup TMP
                        require('child_process').execSync('rm -rf "' + tmpPath + '"');
                        
                        showToast("Cloud Sync Complete!", "success");
                    } catch(deployErr) {
                        console.error(deployErr);
                        showToast("Deploy to Cloud Error: " + deployErr.message, "error");
                    }
                };
                
                if (syncItemAe) {
                    var localAE = path.join(EASE_LIB_DIR, "AE_Settings");
                    var tmpAE = path.join(tmpPath, "AE_Settings");
                    
                    if (settingsChoice === "local") {
                        syncAESettings(EASE_LIB_DIR, "local", function() {
                            if (fs.existsSync(localAE)) copyFolderRecursiveSync(localAE, tmpAE);
                            deployTmpToCloud();
                        });
                    } else if (settingsChoice === "target") {
                        if (fs.existsSync(tmpAE)) copyFolderRecursiveSync(tmpAE, localAE);
                        syncAESettings(EASE_LIB_DIR, "target", function() {
                            deployTmpToCloud();
                        });
                    } else {
                        syncAESettings(EASE_LIB_DIR, "local", function() {
                            if (fs.existsSync(localAE)) copyFolderRecursiveSync(localAE, tmpAE);
                            deployTmpToCloud();
                        });
                    }
                } else {
                    deployTmpToCloud();
                }
            } catch(e) { console.error(e); showToast("Sync Error: " + e.message, "error"); }
        }

        function syncAESettings(targetPath, choice, callback) {
            Bridge.eval('pipeline.getAESettingsPaths()').then(function(res) {
                if (res) {
                    try {
                        var aeTarget = path.join(targetPath, "AE_Settings");
                        if (!fs.existsSync(aeTarget)) safeMkdirSync(aeTarget);
                        
                        if (res.prefFolderPath) {
                            var prefFileName = "Adobe After Effects " + res.majorVersion + " Prefs.txt";
                            var prefFile = path.join(res.prefFolderPath, prefFileName);
                            var targetPrefFile = path.join(aeTarget, prefFileName);
                            if (choice === "local" && fs.existsSync(prefFile)) safeCopyFileSync(prefFile, targetPrefFile);
                            else if (choice === "target" && fs.existsSync(targetPrefFile)) safeCopyFileSync(targetPrefFile, prefFile);
                        }
                        
                        if (res.modifiedWorkspacesPath) {
                            var wsTarget = path.join(aeTarget, "ModifiedWorkspaces");
                            if (choice === "local") copyFolderRecursiveSync(res.modifiedWorkspacesPath, wsTarget);
                            else if (choice === "target" && fs.existsSync(wsTarget)) copyFolderRecursiveSync(wsTarget, res.modifiedWorkspacesPath);
                        }
                        
                        if (res.userPresetsPath) {
                            var upTarget = path.join(aeTarget, "User Presets");
                            if (choice === "local") copyFolderRecursiveSync(res.userPresetsPath, upTarget);
                            else if (choice === "target" && fs.existsSync(upTarget)) copyFolderRecursiveSync(upTarget, res.userPresetsPath);
                        }
                    } catch(e) { console.error("AE Sync error", e); }
                }
                if (callback) callback();
            }).catch(function(e) {
                console.error(e);
                if (callback) callback();
            });
        }

        function safeMkdirSync(targetDir) {
            var sep = path.sep;
            var initDir = path.isAbsolute(targetDir) ? sep : '';
            targetDir.split(sep).reduce(function(parentDir, childDir) {
                var curDir = path.resolve(parentDir, childDir);
                try {
                    if (!fs.existsSync(curDir)) {
                        fs.mkdirSync(curDir);
                    }
                } catch (err) {
                    if (err.code !== 'EEXIST') throw err;
                }
                return curDir;
            }, initDir);
        }

        function safeWriteFileSync(filePath, data) {
            try {
                fs.writeFileSync(filePath, data, 'utf8');
            } catch(e) {
                if (e.code === 'EROFS' || e.message.indexOf('read-only') !== -1 || e.message.indexOf('ENOENT') !== -1) {
                    try {
                        var tempPath = path.join(require('os').tmpdir(), 'motionreis_temp_' + Date.now() + '.txt');
                        fs.writeFileSync(tempPath, data, 'utf8');
                        require('child_process').execSync('cp "' + tempPath + '" "' + filePath + '"');
                        fs.unlinkSync(tempPath);
                    } catch(err2) { throw new Error("Fallback write failed for " + filePath + ": " + err2.message); }
                } else { throw e; }
            }
        }

        function safeCopyFileSync(src, dest) {
            try {
                fs.copyFileSync(src, dest);
            } catch(e) {
                if (e.code === 'EROFS' || e.message.indexOf('read-only') !== -1 || e.message.indexOf('ENOENT') !== -1) {
                    try {
                        require('child_process').execSync('cp "' + src + '" "' + dest + '"');
                    } catch(err2) { throw new Error("Fallback copy failed for " + dest + ": " + err2.message); }
                } else { throw e; }
            }
        }

        // Helper to copy folder recursively
        function copyFolderRecursiveSync(source, target) {
            var files = [];
            if (!fs.existsSync(target)) safeMkdirSync(target);
            
            if (fs.lstatSync(source).isDirectory()) {
                files = fs.readdirSync(source);
                files.forEach(function (file) {
                    var curSource = path.join(source, file);
                    var curTarget = path.join(target, file);
                    if (fs.lstatSync(curSource).isDirectory()) {
                        copyFolderRecursiveSync(curSource, curTarget);
                    } else {
                        try {
                            safeCopyFileSync(curSource, curTarget);
                        } catch(e) { console.error("Error copying file:", curSource, e); }
                    }
                });
            }
        }

        function triggerAutoSync() {
            if (!cloudSyncEnable || !cloudSyncPath) return;
            // Background sync logic would execute here.
            console.log("Auto-syncing to cloud:", cloudSyncPath);
        }

        function togglePinComp() {
            var btn = document.getElementById('pin-comp-btn');
            if (btn) {
                btn.classList.toggle('pinned');
                if (btn.classList.contains('pinned')) {
                    btn.style.color = 'var(--accent-primary)';
                    showToast('Comp Pinned! The renderer will lock to this comp.', 'success');
                } else {
                    btn.style.color = 'var(--text-secondary)';
                    showToast('Comp Unpinned. Auto-detecting active comp...', 'info');
                }
            }
        }
        function scanProjectEffects() {
            var q = document.getElementById('effect-search-input').value;
            if (!q || q.trim() === '') {
                showToast('Please enter an effect name to search.', 'error');
                return;
            }
            
            var container = document.getElementById('effect-scan-results');
            container.innerHTML = '<div style="text-align:center; padding:10px;"><div class="spinner" style="margin:0 auto; width:16px; height:16px; border-width:2px;"></div></div>';
            
            Bridge.loadJSX('pipeline.jsx').then(function() {
                Bridge.callMethod('pipeline', 'run', {action: 'scanEffects', query: q.trim()}).then(function(resStr) {
                    container.innerHTML = '';
                    var res = [];
                    try { res = JSON.parse(resStr); } catch(e) {}
                    
                    if (!res || res.length === 0) {
                        container.innerHTML = '<div style="font-size:10px; color:var(--text-secondary); text-align:center; padding:10px;">No effects found matching "'+q+'".</div>';
                        return;
                    }
                    
                    res.forEach(function(item) {
                        var html = '<div class="recent-proj-row" style="flex-shrink:0;" onclick="selectScannedComp(' + item.compId + ', ' + item.layerIndex + ')">' +
                                     '<div class="proj-icon"><span class="material-symbols-rounded" style="font-size:16px;">lens_blur</span></div>' +
                                     '<div class="proj-info">' +
                                         '<div class="proj-name">' + item.compName + '</div>' +
                                         '<div class="proj-path" style="font-size:9px; opacity:0.8;">Layer: ' + item.layerName + ' • ' + item.effectName + '</div>' +
                                     '</div>' +
                                   '</div>';
                        container.insertAdjacentHTML('beforeend', html);
                    });
                }).catch(function(err) {
                    container.innerHTML = '<div style="font-size:10px; color:var(--accent-danger); text-align:center; padding:10px;">Error: ' + err.message + '</div>';
                });
            });
        }
        
        function selectScannedComp(compId, layerIndex) {
            Bridge.loadJSX('pipeline.jsx').then(function() {
                Bridge.callMethod('pipeline', 'run', {action: 'selectLayerInTimeline', compId: compId, layerIndex: layerIndex}).then(function(res) {
                    // Silent success, selection is visual in AE
                }).catch(function(err) { showToast(err.message, 'error'); });
            });
        }
    </script>
</body>
</html>
