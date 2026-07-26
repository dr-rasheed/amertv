import { generateAddonXml, generateRepositoryXml } from './src/utils/kodiAddonGenerator';
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

const xml1 = generateAddonXml(config as any);
const xml2 = generateRepositoryXml(config as any);

fs.writeFileSync('plugin.xml', xml1);
fs.writeFileSync('repo.xml', xml2);
