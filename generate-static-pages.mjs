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
  
  // 全ての学校とエリアでページ生成
  
  // 学校ページ生成
  schools.forEach(school => {
    const schoolDir = path.join(distPath, 'school', school);
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
    const areaDir = path.join(distPath, 'area', area);
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
  
  // サイトマップページ生成
  generateSitemapPage(schools, areas, distPath, indexHtml);
}

function generateSitemapPage(schools, areas, distPath, indexHtml) {
  // シンプルなHTMLテンプレート
  const sitemapHtml = `<!DOCTYPE html>
<html lang="ja" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>サイトマップ - 福岡市学校区域検索</title>
    <meta name="description" content="福岡市の全小学校・中学校・エリアのリンク集">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .sitemap-container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .sitemap-header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
        }
        .sitemap-header h1 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 2rem;
        }
        .sitemap-header p {
            margin: 5px 0;
            color: #6b7280;
        }
        .sitemap-header a {
            color: #3b82f6;
            text-decoration: none;
        }
        .sitemap-header a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="sitemap-container">
        <div class="sitemap-header">
            <h1>福岡市 学校区域検索 サイトマップ</h1>
            <p>全${schools.length}校・${areas.length}エリアのリンク集</p>
            <p><a href="../">← 検索画面に戻る</a></p>
        </div>
        
        <div class="sitemap-section">
            <div class="sitemap-category">
                <h3>小学校・中学校 (${schools.length}校)</h3>
                <div class="sitemap-links">
                    ${schools.map(school => 
                      `<a href="../school/${encodeURIComponent(school)}/" class="sitemap-link">${school}</a>`
                    ).join('')}
                </div>
            </div>
            
            <div class="sitemap-category">
                <h3>エリア・町名 (${areas.length}件)</h3>
                <div class="sitemap-links">
                    ${areas.map(area => 
                      `<a href="../area/${encodeURIComponent(area)}/" class="sitemap-link">${area}</a>`
                    ).join('')}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  
  // sitemapディレクトリ作成
  const sitemapDir = path.join(distPath, 'sitemap');
  fs.mkdirSync(sitemapDir, { recursive: true });
  
  fs.writeFileSync(path.join(sitemapDir, 'index.html'), sitemapHtml);
  console.log('✅ Sitemap page generated');
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
    </url>
    <url>
        <loc>${hostname}/sitemap/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
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

// .nojekyllをdistにコピー (GitHub Pagesのため)
const nojekyllPath = path.join(__dirname, '.nojekyll');
const distNojekyll = path.join(__dirname, 'dist', '.nojekyll');
if (fs.existsSync(nojekyllPath)) {
  fs.copyFileSync(nojekyllPath, distNojekyll);
  console.log('✅ .nojekyll copied to dist');
}