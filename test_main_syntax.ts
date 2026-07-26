import { generatePythonMainScript } from './src/utils/kodiAddonGenerator';
import * as fs from 'fs';
const config = {
    addonId: 'plugin.video.amertv',
    addonName: 'AmerTV Matrix & ZombiB Repository',
    version: '1.0.0',
    providerName: 'AmerTV Developer',
    summary: 'Summary',
    repoUrl: 'https://dr-rasheed.github.io/amertv',
    dbVersion: 1,
    autoNextEpisode: true
};

const py = generatePythonMainScript(config as any, []);
fs.writeFileSync('main2.py', py);
