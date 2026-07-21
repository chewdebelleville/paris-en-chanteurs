/**
 * Script de génération automatique de sitemap.xml
 * pour "Paris en chanteurs"
 * 
 * Usage:
 *   node generate_sitemap.js [BASE_URL]
 * 
 * Exemple:
 *   node generate_sitemap.js https://www.paris-en-chanteurs.fr
 */

const fs = require('fs');
const path = require('path');

// Configuration du domaine de base (modifiable via argument CLI ou variable d'environnement SITE_URL)
const DEFAULT_BASE_URL = 'https://www.paris-en-chanteurs.fr';
const BASE_URL = (process.argv[2] || process.env.SITE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

// Fichiers/dossiers à exclure spécifiquement du sitemap
const EXCLUDED_PATTERNS = [
    'admin.html',
    'index-old1.html',
    '.git',
    'node_modules',
    'sources',
    '.DS_Store'
];

/**
 * Formate une date au format ISO AAAA-MM-JJ
 */
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Récupère la date de dernière modification d'un fichier
 */
function getFileLastMod(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return formatDate(stats.mtime);
    } catch (err) {
        return formatDate(new Date());
    }
}

/**
 * Échappe les caractères spéciaux XML
 */
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

function generateSitemap() {
    console.log(`🚀 Génération du sitemap avec la URL de base : ${BASE_URL}\n`);

    const urls = [];
    const addedUrls = new Set();

    // 1. Page d'accueil
    const rootIndexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(rootIndexPath)) {
        const homeUrl = `${BASE_URL}/`;
        urls.push({
            loc: homeUrl,
            lastmod: getFileLastMod(rootIndexPath),
            changefreq: 'weekly',
            priority: '1.0'
        });
        addedUrls.add(homeUrl);
    }

    // 2. Découverte des balades sous /promenades/
    const promenadesDir = path.join(__dirname, 'promenades');
    const walkKeysFromData = new Set();

    // A. Lecture depuis data.json
    const dataPath = path.join(__dirname, 'data.json');
    if (fs.existsSync(dataPath)) {
        try {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            const siteData = JSON.parse(rawData);
            if (siteData && siteData.playlists) {
                Object.keys(siteData.playlists).forEach(key => {
                    walkKeysFromData.add(key);
                });
            }
        } catch (e) {
            console.warn("⚠️ Impossible de lire data.json pour la liste des balades:", e.message);
        }
    }

    // B. Découverte des sous-dossiers dans /promenades/
    if (fs.existsSync(promenadesDir)) {
        const items = fs.readdirSync(promenadesDir, { withFileTypes: true });

        items.forEach(item => {
            if (item.isDirectory() && !EXCLUDED_PATTERNS.some(p => item.name.includes(p))) {
                const subIndexPath = path.join(promenadesDir, item.name, 'index.html');
                const walkUrl = `${BASE_URL}/promenades/${item.name}`;
                
                if (!addedUrls.has(walkUrl)) {
                    urls.push({
                        loc: walkUrl,
                        lastmod: fs.existsSync(subIndexPath) ? getFileLastMod(subIndexPath) : formatDate(new Date()),
                        changefreq: 'monthly',
                        priority: '0.8'
                    });
                    addedUrls.add(walkUrl);
                }
                walkKeysFromData.delete(item.name);
            }
        });
    }

    // C. Ajout des clés restantes de data.json si non trouvées sur le disque
    walkKeysFromData.forEach(slug => {
        const walkUrl = `${BASE_URL}/promenades/${slug}`;
        if (!addedUrls.has(walkUrl)) {
            const subIndexPath = path.join(promenadesDir, slug, 'index.html');
            urls.push({
                loc: walkUrl,
                lastmod: fs.existsSync(subIndexPath) ? getFileLastMod(subIndexPath) : formatDate(new Date()),
                changefreq: 'monthly',
                priority: '0.8'
            });
            addedUrls.add(walkUrl);
        }
    });

    // 3. Construction du contenu XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    urls.forEach(urlObj => {
        xml += `  <url>\n`;
        xml += `    <loc>${escapeXml(urlObj.loc)}</loc>\n`;
        xml += `    <lastmod>${urlObj.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${urlObj.changefreq}</changefreq>\n`;
        xml += `    <priority>${urlObj.priority}</priority>\n`;
        xml += `  </url>\n`;
    });

    xml += `</urlset>\n`;

    // 4. Écriture du fichier sitemap.xml
    const sitemapPath = path.join(__dirname, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml, 'utf8');

    console.log(`✅ Fichier sitemap.xml généré avec succès ! (${urls.length} URL incluses)`);
    console.log(`📍 Emplacement : ${sitemapPath}\n`);
    console.log(`URLs incluses :`);
    urls.forEach(u => console.log(`  - ${u.loc} (priorité: ${u.priority}, dern. modif: ${u.lastmod})`));
}

generateSitemap();
