import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CHANNELS } from './src/data/channels';
import { generateM3uContent } from './src/utils/m3uGenerator';
import { generateEpgXmlContent } from './src/utils/epgGenerator';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Direct Raw M3U download / URL for Kodi
  app.get('/api/m3u', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const fullEpgUrl = `${protocol}://${host}/api/epg`;

    const m3uContent = generateM3uContent(INITIAL_CHANNELS, {
      includeEpgUrl: true,
      epgUrl: fullEpgUrl,
      autoRefreshHours: 12,
      customHeaderComments: true,
      kodiUserAgent: 'Kodi/21.0 (IPTV Simple Client)',
    });

    res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="arabic_channels.m3u"');
    res.send(m3uContent);
  });

  // API Route: Direct Raw EPG XML download / URL for Kodi
  app.get('/api/epg', (req, res) => {
    const epgXml = generateEpgXmlContent(INITIAL_CHANNELS, 3);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="epg.xml"');
    res.send(epgXml);
  });

  // Helper API: Url shorteners suggestions & test
  app.post('/api/shorten-info', (req, res) => {
    const { originalUrl } = req.body;
    res.json({
      originalUrl,
      isGdUrl: `https://is.gd/create.php?format=simple&url=${encodeURIComponent(originalUrl)}`,
      tinyUrl: `https://tinyurl.com/api-create.php?url=${encodeURIComponent(originalUrl)}`,
      recommendedAlias: 'arabkodi',
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
