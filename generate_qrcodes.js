const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');

async function main() {
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  const outputDir = path.join(__dirname, 'QR');

  // 1. Crée le répertoire de sortie s'il n'existe pas, ou le vide s'il existe
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      fs.unlinkSync(path.join(outputDir, file));
    }
    console.log("Anciens fichiers de QR codes supprimés.");
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Répertoire de sortie créé : ${outputDir}`);
  }

  // 2. Lit le fichier sitemap.xml
  if (!fs.existsSync(sitemapPath)) {
    console.error("Fichier sitemap.xml non trouvé à la racine !");
    process.exit(1);
  }

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = locRegex.exec(sitemapContent)) !== null) {
    urls.push(match[1].trim());
  }

  if (urls.length === 0) {
    console.error("Aucune URL trouvée dans le sitemap.xml.");
    process.exit(1);
  }

  console.log(`${urls.length} URL(s) trouvée(s) dans le sitemap.xml.`);

  for (const url of urls) {
    // 3. Extrait le slug
    let cleanUrl = url.replace(/\/$/, "");
    const parts = cleanUrl.split('/');
    const lastPart = parts[parts.length - 1];
    let slug = 'accueil';
    if (lastPart && !lastPart.includes('paris-en-chanteurs.fr')) {
      slug = lastPart;
    }

    console.log(`Génération des QR codes pour : ${url} (slug: ${slug})...`);

    const svgPath = path.join(outputDir, `${slug}.svg`);
    const pdfPath = path.join(outputDir, `${slug}.pdf`);

    // 4. Génération du format vectoriel SVG
    const svgOptions = {
      type: 'svg',
      errorCorrectionLevel: 'L', // Correction d'erreur minimale (Low) pour un rendu épuré/minimaliste
      margin: 4, // Zone tranquille standard (quiet zone)
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };

    try {
      const svgString = await QRCode.toString(url, svgOptions);
      fs.writeFileSync(svgPath, svgString, 'utf8');
    } catch (err) {
      console.error(`Erreur lors de la génération du SVG pour ${slug}:`, err);
    }

    // 5. Génération du format vectoriel PDF haute résolution
    try {
      const qrCode = QRCode.create(url, { errorCorrectionLevel: 'L' });
      const size = qrCode.modules.size;
      const data = qrCode.modules.data;

      // Définition des dimensions du PDF en points (1pt = 1/72 inch)
      const pdfPageSize = 250;
      const padding = 25; // Marge (zone tranquille) de 10%
      const qrSize = pdfPageSize - (padding * 2);
      const cellSize = qrSize / size;

      const doc = new PDFDocument({
        size: [pdfPageSize, pdfPageSize],
        margin: padding
      });

      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      // Fond blanc
      doc.rect(0, 0, pdfPageSize, pdfPageSize).fill('#ffffff');

      // Dessin des modules noirs en tant que rectangles vectoriels
      doc.fillColor('#000000');
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (data[row * size + col]) {
            const x = padding + col * cellSize;
            const y = padding + row * cellSize;
            // Un léger chevauchement (0.05pt) évite des lignes blanches de rendu
            doc.rect(x, y, cellSize + 0.05, cellSize + 0.05).fill();
          }
        }
      }

      doc.end();

      // Attend la fin de l'écriture physique du fichier
      await new Promise((resolve) => writeStream.on('finish', resolve));

    } catch (err) {
      console.error(`Erreur lors de la génération du PDF pour ${slug}:`, err);
    }
  }

  console.log("\nGénération terminée avec succès !");
}

main().catch(err => {
  console.error("Erreur globale :", err);
});
