import { generateAddonsXml } from './src/utils/kodiAddonGenerator';
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
require('fs').writeFileSync('addons.xml', generateAddonsXml(config as any));
