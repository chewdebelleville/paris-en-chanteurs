/**
 * Script de génération automatique de sitemap.xml
 * pour "Paris en chanteurs"
 * 
 * Usage:
 *   node generate_sitemap.js [BASE_URL]
 * 
 * Exemple:
 *   node generate_sitemap.js https://parisenchanteurs.fr
 */

const fs = require('fs');
const path = require('path');

// Configuration du domaine de base (modifiable via argument CLI ou variable d'environnement SITE_URL)
const DEFAULT_BASE_URL = 'https://parisenchanteurs.fr';
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

    // 1. Page d'accueil
    const rootIndexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(rootIndexPath)) {
        urls.push({
            loc: `${BASE_URL}/`,
            lastmod: getFileLastMod(rootIndexPath),
            changefreq: 'weekly',
            priority: '1.0'
        });
    }

    // 2. Découverte dynamique des pages de balades
    // A. Lecture de data.json si disponible
    const dataPath = path.join(__dirname, 'data.json');
    const walkKeysFromData = new Set();

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

    // B. Parcours du répertoire pour détecter tous les dossiers contenant index.html
    const items = fs.readdirSync(__dirname, { withFileTypes: true });

    items.forEach(item => {
        // Exclure les fichiers / dossiers de la liste d'exclusion
        if (EXCLUDED_PATTERNS.some(pattern => item.name.includes(pattern))) {
            return;
        }

        if (item.isDirectory()) {
            const subIndexPath = path.join(__dirname, item.name, 'index.html');
            if (fs.existsSync(subIndexPath)) {
                urls.push({
                    loc: `${BASE_URL}/${item.name}/`,
                    lastmod: getFileLastMod(subIndexPath),
                    changefreq: 'monthly',
                    priority: '0.8'
                });
                walkKeysFromData.delete(item.name);
            }
        }
    });

    // C. Si des clés de data.json existent mais le dossier n'a pas encore été analysé (ex: si créé dynamiquement)
    walkKeysFromData.forEach(key => {
        const subIndexPath = path.join(__dirname, key, 'index.html');
        urls.push({
            loc: `${BASE_URL}/${key}/`,
            lastmod: fs.existsSync(subIndexPath) ? getFileLastMod(subIndexPath) : formatDate(new Date()),
            changefreq: 'monthly',
            priority: '0.8'
        });
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
