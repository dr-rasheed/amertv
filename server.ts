import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CHANNELS } from './src/data/channels';
import { generateM3uContent } from './src/utils/m3uGenerator';
import { generateEpgXmlContent } from './src/utils/epgGenerator';
import { parseM3uText } from './src/utils/m3uParser';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS middleware for Kodi and external player clients
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Handler for direct M3U output
  const handleM3uRequest = (req: express.Request, res: express.Response) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const fullEpgUrl = `${protocol}://${host}/ar.xml`;

    const m3uContent = generateM3uContent(INITIAL_CHANNELS, {
      includeEpgUrl: true,
      epgUrl: fullEpgUrl,
      autoRefreshHours: 12,
      customHeaderComments: true,
      kodiUserAgent: 'Kodi/21.0 (IPTV Simple Client)',
    });

    res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="ar.m3u"');
    res.send(m3uContent);
  };

  // Handler for direct EPG XML output
  const handleEpgRequest = (req: express.Request, res: express.Response) => {
    const epgXml = generateEpgXmlContent(INITIAL_CHANNELS, 3);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="ar.xml"');
    res.send(epgXml);
  };

  // Direct routes for Kodi Simple Client
  app.get('/ar.m3u', handleM3uRequest);
  app.get('/api/m3u', handleM3uRequest);
  app.get('/ar.xml', handleEpgRequest);
  app.get('/api/epg', handleEpgRequest);

  // Live Proxy & Merge with IPTV-Org
  app.get('/api/iptvorg', async (req, res) => {
    try {
      const response = await fetch('https://iptv-org.github.io/iptv/languages/ara.m3u');
      if (!response.ok) {
        throw new Error(`Failed to fetch iptv-org: ${response.statusText}`);
      }
      const text = await response.text();
      const parsedChannels = parseM3uText(text);

      // Merge with initial channels, putting NatGeo Abu Dhabi at the top
      const combined = [...INITIAL_CHANNELS, ...parsedChannels.filter(p => !INITIAL_CHANNELS.some(i => i.name.toLowerCase() === p.name.toLowerCase()))];

      if (req.query.format === 'm3u') {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const m3uContent = generateM3uContent(combined, {
          includeEpgUrl: true,
          epgUrl: `${protocol}://${host}/ar.xml`,
          autoRefreshHours: 12,
          customHeaderComments: true,
          kodiUserAgent: 'Kodi/21.0 (IPTV Simple Client)',
        });
        res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
        return res.send(m3uContent);
      }

      res.json({
        success: true,
        totalChannels: combined.length,
        channels: combined,
      });
    } catch (err: any) {
      console.error('IPTV-Org fetch error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Error fetching iptv-org playlist',
        channels: INITIAL_CHANNELS,
      });
    }
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
