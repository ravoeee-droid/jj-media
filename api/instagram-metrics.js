const VIEW_PATTERNS = [
  /\"play_count\"\s*:\s*(\d+)/i,
  /\"video_view_count\"\s*:\s*(\d+)/i,
  /\"view_count\"\s*:\s*(\d+)/i,
  /\"playCount\"\s*:\s*(\d+)/i,
  /\"videoViewCount\"\s*:\s*(\d+)/i
];

const LIKE_PATTERNS = [
  /\"like_count\"\s*:\s*(\d+)/i,
  /\"edge_media_preview_like\"\s*:\s*\{[^}]*\"count\"\s*:\s*(\d+)/i
];

function firstNumber(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

export default async function handler(req, res) {
  const code = String(req.query.code || '').trim();
  const type = String(req.query.type || 'reel') === 'p' ? 'p' : 'reel';
  if (!/^[A-Za-z0-9_-]{5,30}$/.test(code)) {
    return res.status(400).json({ ok: false, error: 'invalid_code' });
  }

  const url = `https://www.instagram.com/${type}/${code}/embed/`;
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
        'accept-language': 'de-DE,de;q=0.9,en;q=0.8'
      }
    });
    const html = await response.text();
    const views = firstNumber(html, VIEW_PATTERNS);
    const likes = firstNumber(html, LIKE_PATTERNS);

    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      ok: response.ok,
      status: response.status,
      code,
      type,
      views,
      likes,
      source: views !== null ? 'public_embed' : 'public_embed_no_views'
    });
  } catch (error) {
    return res.status(502).json({ ok: false, code, type, views: null, likes: null, source: 'fetch_failed' });
  }
}
