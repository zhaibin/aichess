// SEO模板

export function getRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: https://aichess.win/sitemap.xml`;
}

export function getSitemap(): string {
  const now = new Date().toISOString();
  const baseUrl = 'https://aichess.win';
  const languages = ['zh-CN', 'zh-TW', 'en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'ko'];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>`;

  // 添加hreflang链接
  for (const lang of languages) {
    sitemap += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/?lang=${lang}" />`;
  }

  sitemap += `
  </url>`;

  // 为每种语言添加单独的URL
  for (const lang of languages) {
    sitemap += `
  <url>
    <loc>${baseUrl}/?lang=${lang}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  sitemap += `
</urlset>`;

  return sitemap;
}

export function getManifest(): string {
  return JSON.stringify({
    name: 'AIChess',
    short_name: 'AIChess',
    description: 'AI-powered chess platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#667eea',
    theme_color: '#667eea',
    icons: []
  }, null, 2);
}

