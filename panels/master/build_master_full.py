import re

panels = ['motion', 'pipeline', 'creative', 'layers']
sidebar_html = ""
content_html = ""
styles = ""
scripts = ""

for p in panels:
    with open(f"../{p}/index.html", "r") as f:
        data = f.read()
        
        # Extract sidebar buttons
        sidebar_match = re.search(r'<div class="sidebar">(.*?)</div>\s*<div class="main-content">', data, re.DOTALL)
        if sidebar_match:
            buttons = sidebar_match.group(1).strip()
            buttons = buttons.replace('class="tab-btn active"', 'class="tab-btn"')
            sidebar_html += f"            <!-- {p.upper()} -->\n            " + buttons + "\n            <hr>\n"
            
        # Extract main content modules
        content_match = re.search(r'<div class="main-content">(.*?)</div>\s*</div>\s*<script', data, re.DOTALL)
        if not content_match:
             content_match = re.search(r'<div class="main-content">(.*?)</div>\s*</div>\s*<!-- Scripts', data, re.DOTALL)
        if content_match:
            mods = content_match.group(1).strip()
            mods = mods.replace('class="module-container active"', 'class="module-container"')
            content_html += f"            <!-- {p.upper()} -->\n            " + mods + "\n\n"
            
        # Extract styles
        style_match = re.search(r'<style>(.*?)</style>', data, re.DOTALL)
        if style_match:
            # remove the default styles we already have
            s = style_match.group(1).strip()
            s = re.sub(r'\.setting-row\s*\{.*?\}', '', s)
            s = re.sub(r'select\s*\{.*?\}', '', s)
            s = re.sub(r'\.toggle-btn\s*\{.*?\}', '', s)
            s = re.sub(r'\.toggle-btn\.on\s*\{.*?\}', '', s)
            s = re.sub(r'\.grid-2\s*\{.*?\}', '', s)
            s = re.sub(r'\.grid-3\s*\{.*?\}', '', s)
            s = re.sub(r'\.color-swatch\s*\{.*?\}', '', s)
            styles += f"        /* --- {p.upper()} STYLES --- */\n        {s}\n\n"
            
        # Extract scripts (ignore bridge.js, csinterface.js, setupTabs, loader logic)
        script_match = re.findall(r'<script>(.*?)</script>', data, re.DOTALL)
        if script_match:
            # usually the last script tag contains the logic
            s = script_match[-1].strip()
            # remove setupTabs() call
            s = re.sub(r'setupTabs\(\);', '', s)
            # remove loader logic
            s = re.sub(r'let loaderHidden = false;.*?(?:Promise\.all|document\.fonts\.ready).*?catch.*?}\);', '', s, flags=re.DOTALL)
            s = re.sub(r'let loaderHidden = false;.*?\n\s+\]\)\.then.*?catch.*?}\);', '', s, flags=re.DOTALL)
            s = re.sub(r'let loaderHidden = false, fontsReady = false, jsxReady = false;.*?Promise\.all.*?}\);', '', s, flags=re.DOTALL)
            s = re.sub(r'// ── Loader.*?jsxReady\s*=\s*false;', '', s, flags=re.DOTALL)
            scripts += f"        // --- {p.upper()} SCRIPTS ---\n        {s}\n\n"

master_file = "index.html"
with open(master_file, "r") as f:
    master_data = f.read()

# Make it match the actual HTML
sidebar_start = master_data.find('<div class="sidebar">')
content_end = master_data.rfind('</div>\n    </div>\n\n    <!-- Scripts -->')
if content_end == -1:
    content_end = master_data.rfind('</div>\n    </div>\n\n    <script')

if sidebar_start != -1 and content_end != -1:
    # Build new HTML
    before_sidebar = master_data[:sidebar_start + len('<div class="sidebar">\n')]
    
    sidebar_content = '            <button class="tab-btn active" data-target="mod-home"><span class="material-symbols-rounded">space_dashboard</span> Home</button>\n            <hr>\n' + sidebar_html + '        </div>\n\n        <!-- Main Content Area -->\n        <div class="main-content">\n'
    
    main_content_html = '            <!-- HOME -->\n            <div id="mod-home" class="module-container active">\n                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center;">\n                    <span><span class="material-symbols-rounded" style="vertical-align:bottom; margin-right:4px;">space_dashboard</span> Home</span>\n                </div>\n                <p style="font-size:11px; color:var(--text-secondary); margin-top:0; margin-bottom:16px;">Quick access to your favorite modules.</p>\n            </div>\n\n' + content_html
    
    after_content = master_data[content_end:]
    
    new_data = before_sidebar + sidebar_content + main_content_html + after_content
    
    # Inject styles
    style_start = new_data.find('<style>') + len('<style>\n')
    style_end = new_data.find('</style>')
    base_styles = new_data[style_start:style_end].strip()
    # clean out previous injections
    base_styles = re.sub(r'/\* --- .*? STYLES --- \*/.*?(?=/\* ---|$)', '', base_styles, flags=re.DOTALL)
    new_styles = base_styles + "\n\n" + styles
    new_data = new_data[:style_start] + new_styles + new_data[style_end:]
    
    # Inject scripts
    script_start = new_data.rfind('<script>') + len('<script>\n')
    script_end = new_data.rfind('</script>')
    base_scripts = new_data[script_start:script_end].strip()
    
    # keep only setupTabs and loader logic from master
    base_scripts_clean = ""
    for line in base_scripts.split('\n'):
        if "--- " not in line and "SCRIPTS ---" not in line and "function updateWingman" not in line:
            base_scripts_clean += line + "\n"
            
    # wait, it's safer to just rewrite the whole script tag from scratch for master:
    master_script = """
        setupTabs();

        let loaderHidden = false, fontsReady = false, jsxReady = false;
        function tryHideLoader() {
            if (loaderHidden || !fontsReady || !jsxReady) return;
            loaderHidden = true;
            const l = document.getElementById('app-loader');
            if (l) l.classList.add('hidden');
        }
        setTimeout(() => { fontsReady = true; jsxReady = true; tryHideLoader(); }, 6000);
        document.fonts.ready.then(() => { fontsReady = true; tryHideLoader(); });
        Promise.all([
            Bridge.loadJSX('utils.jsx'),
            Bridge.loadJSX('motion.jsx'),
            Bridge.loadJSX('layers.jsx'),
            Bridge.loadJSX('creative.jsx'),
            Bridge.loadJSX('pipeline.jsx')
        ]).then(() => { jsxReady = true; tryHideLoader(); })
          .catch(() => { jsxReady = true; tryHideLoader(); });

        function exec(moduleName, method, args = {}) {
            Bridge.callMethod(moduleName, method, args)
                .catch(function(err) { alert('Error: ' + err.message); });
        }
        
        function goToTab(targetId) {
            const btn = document.querySelector(`.tab-btn[data-target="${targetId}"]`);
            if (btn) btn.click();
        }
""" + scripts
    
    new_data = new_data[:script_start] + master_script + "\n    " + new_data[script_end:]
    
    with open("index.html", "w") as out:
        out.write(new_data)
    print("Success")
else:
    print("Could not find boundaries")
