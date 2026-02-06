
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SITE CONFIGURATION ---
// Duplicated from constants.ts to avoid TypeScript compilation complexity in this script
const SITE_CONFIG = {
  baseUrl: 'https://moeku.org', // Replace with your actual domain
  appName: "Moeku's 导航页",
  userName: "卡介菌",
  bio: "时光流转，愿你与珍爱之人再度重逢",
  links: [
    {
      title: 'My Blog',
      url: 'https://blog.moeku.org',
      description: 'Notes & Thoughts',
    },
    {
      title: 'Netdisk',
      url: 'https://cloud.guguwo.top',
      description: 'Cloud Storage',
    },
    {
      title: 'Bilibili',
      url: 'https://space.bilibili.com/439704151',
      description: 'Anime & Fun',
    },
    {
      title: 'GitHub',
      url: 'https://github.com/Kajiekazz',
      description: 'My Projects',
    },
  ]
};

const DIST_DIR = path.resolve(__dirname, '../dist');
const PUBLIC_DIR = path.resolve(__dirname, '../public');

// Ensure output directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 1. GENERATE SITEMAP.XML
const generateSitemap = () => {
  const currentDate = new Date().toISOString();
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_CONFIG.baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${SITE_CONFIG.links.map(link => `
  <url>
    <loc>${link.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;

  // Write to public (for dev) and dist (for build)
  ensureDir(PUBLIC_DIR);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapContent);
  console.log('✅ Generated sitemap.xml');
};

// 2. GENERATE RSS.XML
const generateRss = () => {
  const rssContent = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${SITE_CONFIG.appName}</title>
  <link>${SITE_CONFIG.baseUrl}</link>
  <description>${SITE_CONFIG.bio}</description>
  <language>zh-cn</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <generator>Etheria Portal Builder</generator>
  <atom:link href="${SITE_CONFIG.baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
  ${SITE_CONFIG.links.map(link => `
  <item>
    <title><![CDATA[${link.title}]]></title>
    <link>${link.url}</link>
    <description><![CDATA[${link.description}]]></description>
    <author>${SITE_CONFIG.userName}</author>
    <guid>${link.url}</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
  </item>
  `).join('')}
</channel>
</rss>`;

  ensureDir(PUBLIC_DIR);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), rssContent);
  console.log('✅ Generated rss.xml');
};

// Run generation
try {
  generateSitemap();
  generateRss();
} catch (error) {
  console.error('Error generating feeds:', error);
  process.exit(1);
}
