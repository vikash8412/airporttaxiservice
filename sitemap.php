<?php
/*
 * Dynamic sitemap: static pages + every post from the NammaTaxi posts API.
 * Served at /sitemap.xml via .htaccess. Result is cached for CACHE_TTL seconds
 * so search engines don't hit the API on every crawl.
 */

const SITE      = 'https://airporttaxiservice.in';
const API_BASE  = 'https://nammataxi.com';
const WEBSITE   = 'airporttaxiservice';   // same as postsWebsite in assets/js/config.js
const PER_PAGE  = 48;                     // API caps per_page at 48
const CACHE_TTL = 6 * 3600;
const CACHE     = __DIR__ . '/.sitemap-cache.xml';

$pages = [
  ['/',                   'weekly',  '1.0'],
  ['/airport-pickup',     'monthly', '0.9'],
  ['/airport-drop',       'monthly', '0.9'],
  ['/airport-round-trip', 'monthly', '0.9'],
  ['/outstation',         'monthly', '0.8'],
  ['/tour-packages',      'monthly', '0.8'],
  ['/blog',               'weekly',  '0.7'],
  ['/contact',            'yearly',  '0.5'],
];

header('Content-Type: application/xml; charset=UTF-8');

if (is_file(CACHE) && time() - filemtime(CACHE) < CACHE_TTL) {
  readfile(CACHE);
  exit;
}

function fetch_json($url) {
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_FOLLOWLOCATION => true]);
    $body = curl_exec($ch);
    $ok = $body !== false && curl_getinfo($ch, CURLINFO_HTTP_CODE) === 200;
    curl_close($ch);
  } else {
    $body = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 15]]));
    $ok = $body !== false;
  }
  return $ok ? json_decode($body, true) : null;
}

// Collect all posts, page by page
$posts = [];
$apiOk = true;
for ($page = 1, $last = 1; $page <= $last && $page <= 100; $page++) {
  $res = fetch_json(API_BASE . '/api/posts?' . http_build_query(['website' => WEBSITE, 'per_page' => PER_PAGE, 'page' => $page]));
  if (!$res || !isset($res['data'])) { $apiOk = false; break; }
  $posts = array_merge($posts, $res['data']);
  $last = (int)($res['meta']['last_page'] ?? 1);
}

// API down: serve the last good cache rather than a sitemap without posts
if (!$apiOk && is_file(CACHE)) {
  readfile(CACHE);
  exit;
}

$e = function ($s) { return htmlspecialchars($s, ENT_XML1 | ENT_QUOTES, 'UTF-8'); };

$xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($pages as [$path, $freq, $prio]) {
  $xml .= "  <url><loc>{$e(SITE . $path)}</loc><changefreq>$freq</changefreq><priority>$prio</priority></url>\n";
}
foreach ($posts as $p) {
  if (empty($p['page_slug'])) continue;
  $loc = SITE . '/post?slug=' . rawurlencode($p['page_slug']);
  $mod = !empty($p['created_at']) ? '<lastmod>' . date('Y-m-d', strtotime($p['created_at'])) . '</lastmod>' : '';
  $xml .= "  <url><loc>{$e($loc)}</loc>$mod<changefreq>monthly</changefreq><priority>0.6</priority></url>\n";
}
$xml .= "</urlset>\n";

if ($apiOk) @file_put_contents(CACHE, $xml, LOCK_EX);
echo $xml;
