const fs = require('fs');
let content = fs.readFileSync('src/utils/kodiAddonGenerator.ts', 'utf-8');

// The original generator returns:
// import traceback
// import xbmcgui
// 
// try:
// \${indentedCode}

const oldTop = `import traceback
import xbmcgui

try:`;

const newTop = `import sys
import os
import traceback
import xbmc
import xbmcgui
import xbmcplugin
import xbmcvfs

try:`;

content = content.replace(oldTop, newTop);

// I should also remove the redundant imports from the indentedCode in rawPython
// But Python handles multiple imports gracefully, so it's fine. 
// Just to be safe, I'll let them be.

fs.writeFileSync('src/utils/kodiAddonGenerator.ts', content);
console.log('Fixed imports in python template');
