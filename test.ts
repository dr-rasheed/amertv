import { generatePythonMainScript } from './src/utils/kodiAddonGenerator';

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

const script = generatePythonMainScript(config as any, []);
import * as fs from 'fs';
fs.writeFileSync('main.py', script);
