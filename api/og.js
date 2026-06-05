const fs = require('fs');
const path = require('path');
 
module.exports = async function handler(req, res) {
  const { id } = req.query;
 
  const SUPABASE_URL = 'https://fdpusoayzjbuapgqmnoz.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_fvkdCvm3VaB8W7r6ywEvnA_zNbyAPil';
 
  let title = 'Still Here — A Place of Remembrance';
  let description = 'A quiet place to share memories and honour the pets we have loved and lost.';
  let image = '';
 
  if (id) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/memorials?id=eq.${id}&select=name,species,years,memory,photo_url,photo_urls`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const m = data[0];
        title = `In memory of ${m.name}${m.species ? ` — ${m.species}` : ''}${m.years ? ` · ${m.years}` : ''}`;
        description = m.memory ? m.memory.slice(0, 200) : 'Forever loved. Forever missed. Still here.';
        image = (m.photo_urls && m.photo_urls.length > 0) ? m.photo_urls[0] : (m.photo_url || '');
      }
    } catch (e) {
      // fall through to defaults
    }
  }
 
  let html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
 
  const ogTags = `
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://${req.headers.host}${req.url}">
  <meta property="og:site_name" content="Still Here">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : ''}`;
 
  html = html.replace('</head>', ogTags + '\n</head>');
 
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.status(200).send(html);
};
 
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
 
 
