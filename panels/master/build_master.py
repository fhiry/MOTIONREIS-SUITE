import re

panels = ['motion', 'pipeline', 'creative', 'layers']
sidebar_html = ""
content_html = ""

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

master_file = "index.html"
with open(master_file, "r") as f:
    master_data = f.read()

# Make it match the actual HTML
# find sidebar
sidebar_start = master_data.find('<div class="sidebar">')
content_end = master_data.rfind('</div>\n    </div>\n\n    <!-- Scripts -->')
if content_end == -1:
    content_end = master_data.rfind('</div>\n    </div>\n\n    <script')

if sidebar_start != -1 and content_end != -1:
    before_sidebar = master_data[:sidebar_start + len('<div class="sidebar">\n')]
    
    sidebar_content = '            <button class="tab-btn active" data-target="mod-home"><span class="material-symbols-rounded">space_dashboard</span> Home</button>\n            <hr>\n' + sidebar_html + '        </div>\n\n        <!-- Main Content Area -->\n        <div class="main-content">\n'
    
    main_content_html = '            <!-- HOME -->\n            <div id="mod-home" class="module-container active">\n                <div class="module-header" style="display:flex; justify-content:space-between; align-items:center;">\n                    <span><span class="material-symbols-rounded" style="vertical-align:bottom; margin-right:4px;">space_dashboard</span> Home</span>\n                </div>\n                <p style="font-size:11px; color:var(--text-secondary); margin-top:0; margin-bottom:16px;">Quick access to your favorite modules.</p>\n            </div>\n\n' + content_html
    
    after_content = master_data[content_end:]
    
    new_data = before_sidebar + sidebar_content + main_content_html + after_content
    
    with open("index.html", "w") as out:
        out.write(new_data)
    print("Success")
else:
    print("Could not find boundaries")
