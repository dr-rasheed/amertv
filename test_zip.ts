import { createRepositoryZipBlob } from './src/utils/kodiAddonGenerator';
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

createRepositoryZipBlob(config as any).then(blob => {
    // Save blob to file
    blob.arrayBuffer().then(buffer => {
        fs.writeFileSync('repo.zip', Buffer.from(buffer));
    });
});
