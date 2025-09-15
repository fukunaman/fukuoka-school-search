#!/usr/bin/env node
// 静的ページを生成するスクリプト

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCSV() {
  const csvPath = path.join(__dirname, 'data', 'data.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1);
  
  const schools = new Set();
  const areas = new Set();
  
  lines.forEach(line => {
    if (line.trim()) {
      const [elementary, middle, district, town] = line.split(',');
      
      if (elementary && elementary !== '小学校') {
        schools.add(elementary);
      }
      if (middle && middle !== '中学校') {
        schools.add(middle);
      }
      if (town && town !== '町名') {
        areas.add(town);
      }
    }
  });
  
  return {
    schools: Array.from(schools).sort(),
    areas: Array.from(areas).sort()
  };
}

function generateStaticPages() {
  const { schools, areas } = parseCSV();
  const distPath = path.join(__dirname, 'dist');
  
  // distのindex.htmlを読み込み
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ dist/index.html not found. Run build first.');
    return;
  }
  
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');
  
  // 学校ページ生成
  schools.forEach(school => {
    const schoolDir = path.join(distPath, 'school', encodeURIComponent(school));
    fs.mkdirSync(schoolDir, { recursive: true });
    
    // メタタグとスクリプトを追加
    const schoolHtml = indexHtml
      .replace('<title>福岡市 小学校・中学校校区・高校学区検索 | 住所から校区・学区を検索</title>', 
               `<title>${school} - 福岡市学校区域検索</title>`)
      .replace(/src="\/fukuoka-school-search\//g, 'src="../../')
      .replace(/href="\/fukuoka-school-search\//g, 'href="../../')
      .replace('</head>', `
    <script>
      window.__PRELOADED_SCHOOL__ = "${school}";
    </script>
    </head>`);
    
    fs.writeFileSync(path.join(schoolDir, 'index.html'), schoolHtml);
  });
  
  // エリアページ生成
  areas.forEach(area => {
    const areaDir = path.join(distPath, 'area', encodeURIComponent(area));
    fs.mkdirSync(areaDir, { recursive: true });
    
    const areaHtml = indexHtml
      .replace('<title>福岡市 小学校・中学校校区・高校学区検索 | 住所から校区・学区を検索</title>', 
               `<title>${area} - 福岡市学校区域検索</title>`)
      .replace(/src="\/fukuoka-school-search\//g, 'src="../../')
      .replace(/href="\/fukuoka-school-search\//g, 'href="../../')
      .replace('</head>', `
    <script>
      window.__PRELOADED_AREA__ = "${area}";
    </script>
    </head>`);
    
    fs.writeFileSync(path.join(areaDir, 'index.html'), areaHtml);
  });
  
  console.log(`✅ Generated ${schools.length} school pages and ${areas.length} area pages`);
}

// sitemapも更新
function generateSitemap() {
  const { schools, areas } = parseCSV();
  const hostname = 'https://fukunaman.github.io/fukuoka-school-search';
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${hostname}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>`;
  
  // 学校ページ
  schools.forEach(school => {
    xml += `
    <url>
        <loc>${hostname}/school/${encodeURIComponent(school)}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
  });
  
  // エリアページ
  areas.forEach(area => {
    xml += `
    <url>
        <loc>${hostname}/area/${encodeURIComponent(area)}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
  });
  
  xml += '\n</urlset>';
  
  const distPath = path.join(__dirname, 'dist');
  fs.writeFileSync(path.join(distPath, 'sitemap.xml'), xml);
  console.log(`✅ Sitemap generated with ${schools.length} schools and ${areas.length} areas`);
}

generateStaticPages();
generateSitemap();

// 404.htmlをpublicからdistにコピー (Viteでコピーされないので手動)
const publicPath404 = path.join(__dirname, 'public', '404.html');
const distPath404 = path.join(__dirname, 'dist', '404.html');

if (fs.existsSync(publicPath404)) {
  fs.copyFileSync(publicPath404, distPath404);
  console.log('✅ 404.html copied to dist');
}