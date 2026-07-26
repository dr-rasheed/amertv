const fs = require('fs');
let content = fs.readFileSync('src/utils/kodiAddonGenerator.ts', 'utf-8');

const oldExcept = `except Exception as e:
    xbmcgui.Dialog().textviewer("AmerTV Error", traceback.format_exc())
\`;`;
const newExcept = `except Exception as e:
    xbmc.log("AmerTV Crash: " + traceback.format_exc(), xbmc.LOGERROR)
    xbmcgui.Dialog().textviewer("AmerTV Error", traceback.format_exc())
    try:
        xbmcplugin.endOfDirectory(int(sys.argv[1]), succeeded=False)
    except:
        pass
\`;`;

content = content.replace(oldExcept, newExcept);
fs.writeFileSync('src/utils/kodiAddonGenerator.ts', content);
console.log('Fixed except block');
