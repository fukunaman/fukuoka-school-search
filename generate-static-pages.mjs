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
  
  // ふりがなCSVを読み込んでソート
  const areaKanaPath = path.join(__dirname, 'data', 'kana.csv');
  const areaKanaContent = fs.readFileSync(areaKanaPath, 'utf-8');
  const areaKanaLines = areaKanaContent.split('\n').slice(1);
  
  const schoolKanaPath = path.join(__dirname, 'data', 'high_school_kana.csv');
  const schoolKanaContent = fs.readFileSync(schoolKanaPath, 'utf-8');
  const schoolKanaLines = schoolKanaContent.split('\n');
  
  const kanaMap = new Map();
  
  // エリアのふりがなを追加
  areaKanaLines.forEach(line => {
    if (line.trim()) {
      const [name, kana] = line.split(',');
      if (name && kana) {
        kanaMap.set(name, kana);
      }
    }
  });
  
  // 学校のふりがなを追加
  schoolKanaLines.forEach(line => {
    if (line.trim()) {
      const [name, kana] = line.split(',');
      if (name && kana) {
        kanaMap.set(name, kana);
      }
    }
  });
  
  // あいうえお順ソート関数
  function sortByKana(arr) {
    return arr.sort((a, b) => {
      const kanaA = kanaMap.get(a) || a;
      const kanaB = kanaMap.get(b) || b;
      return kanaA.localeCompare(kanaB, 'ja');
    });
  }
  
  return {
    schools: sortByKana(Array.from(schools)),
    areas: sortByKana(Array.from(areas))
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
               `<title>${school}の校区・通学区域 | 福岡市学校区域検索</title>`)
      .replace('<meta name="description" content="福岡市の住所から通学する小学校・中学校・高校学区を簡単検索。百道浜小、照葉小、西新小など市内全ての学校に対応。天神・博多・百道浜・照葉など585件の詳細区域データで番地レベルまで正確判定。">', 
               `<meta name="description" content="${school}の通学区域・校区情報。福岡市の${school}に通う地域・住所一覧。転校・引越し・入学準備の参考情報。">`)
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
               `<title>${area}の小学校・中学校 | 福岡市学校区域検索</title>`)
      .replace('<meta name="description" content="福岡市の住所から通学する小学校・中学校・高校学区を簡単検索。百道浜小、照葉小、西新小など市内全ての学校に対応。天神・博多・百道浜・照葉など585件の詳細区域データで番地レベルまで正確判定。">', 
               `<meta name="description" content="福岡市${area}の小学校・中学校情報。${area}から通う学校と校区・学区情報。引越し・転校の参考に。">`)
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
    <title>サイトマップ | 福岡市小学校・中学校・エリア一覧 - 福岡市学校区域検索</title>
    <meta name="description" content="福岡市中央区、福岡市早良区、福岡市東区、福岡市西区、福岡市南区、福岡市博多区、福岡市城南区の小学校146校、中学校69校、全394エリアの完全リンク集。百道浜小、照葉小、舞鶴小など市内全学校と天神、博多、百道浜など全地域を網羅。">
    <link rel="canonical" href="https://fukunaman.github.io/fukuoka-school-search/sitemap/">
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
        .sitemap-section {
            max-width: 1400px;
            margin: 0 auto;
        }
        .sitemap-category {
            margin-bottom: 40px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .sitemap-category h3 {
            font-size: 1.5rem;
            color: #374151;
            margin-bottom: 20px;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .sitemap-links {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 10px;
            padding: 15px;
            line-height: 1.8;
        }
        .sitemap-link {
            display: block;
            padding: 12px 15px;
            color: #374151;
            text-decoration: none;
            border-radius: 10px;
            transition: all 0.2s ease;
            font-weight: 500;
            font-size: 0.95rem;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #e5e7eb;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .sitemap-link:hover,
        .sitemap-link:focus {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
            color: #1e40af;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            text-decoration: none;
            border-color: rgba(59, 130, 246, 0.4);
        }
        @media (max-width: 768px) {
            .sitemap-links {
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 8px;
                padding: 10px;
            }
            
            .sitemap-link {
                padding: 10px 12px;
                font-size: 0.85rem;
            }
            
            .sitemap-category {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="sitemap-container">
        <div class="sitemap-header">
            <h1>福岡市 学校区域検索 サイトマップ</h1>
            <p>福岡市中央区・早良区・東区・西区・南区・博多区・城南区の全7区対応</p>
            <p>小学校・中学校 全${schools.length}校、エリア ${areas.length}件の完全リンク集</p>
            <p><a href="../">← 検索画面に戻る</a></p>
        </div>
        
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "福岡市学校・エリア一覧",
          "description": "福岡市中央区、福岡市早良区、福岡市東区、福岡市西区、福岡市南区、福岡市博多区、福岡市城南区の全7区を網羅した小学校・中学校とエリアのリンク集",
          "numberOfItems": ${schools.length + areas.length},
          "url": "https://fukunaman.github.io/fukuoka-school-search/sitemap/"
        }
        </script>
        
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