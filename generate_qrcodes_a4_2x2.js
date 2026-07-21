const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');

async function main() {
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  const pdfOutputPath = path.join(__dirname, 'QR', 'QR-codes-all-2x2.pdf');

  // S'assure que le répertoire QR existe
  const outputDir = path.dirname(pdfOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Lit le fichier sitemap.xml
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

  console.log(`Génération de la planche A4 PDF (2x2cm) avec ${urls.length} QR codes...`);

  // Initialise le document PDF au format A4 (595.28 x 841.89 points)
  const doc = new PDFDocument({
    size: 'A4',
    margin: 0
  });

  const writeStream = fs.createWriteStream(pdfOutputPath);
  doc.pipe(writeStream);

  // Fond de page blanc
  doc.rect(0, 0, 595.28, 841.89).fill('#ffffff');

  // Titres en haut de page
  doc.fillColor('#005c41'); // Couleur principale vert foncé
  doc.font('Helvetica-Bold').fontSize(18).text('Paris en chanteurs — Planche QR Codes (2x2cm)', 0, 45, { align: 'center' });
  doc.font('Helvetica-Oblique').fontSize(9).fillColor('#555555').text('Collection Gallimard Voyage • Format unitaire : 2 x 2 cm', 0, 68, { align: 'center' });

  // Configuration de la grille
  const qrCm = 2.0;
  const ptPerCm = 72 / 2.54;
  const qrSize = qrCm * ptPerCm; // environ 56.69 points
  
  const columns = 4;
  const marginLeft = 65;
  const gapX = (595.28 - (marginLeft * 2) - (columns * qrSize)) / (columns - 1); // environ 79.5 points

  const marginTop = 110;
  const gapY = 85;

  let index = 0;
  for (const url of urls) {
    // Extrait le slug
    let cleanUrl = url.replace(/\/$/, "");
    const parts = cleanUrl.split('/');
    const lastPart = parts[parts.length - 1];
    let slug = 'accueil';
    if (lastPart && !lastPart.includes('paris-en-chanteurs.fr')) {
      slug = lastPart;
    }

    const row = Math.floor(index / columns);
    const col = index % columns;

    const x = marginLeft + col * (qrSize + gapX);
    const y = marginTop + row * (qrSize + gapY);

    // Génère la structure matricielle du QR code (Niveau L)
    const qrCode = QRCode.create(url, { errorCorrectionLevel: 'L' });
    const qrMatrixSize = qrCode.modules.size;
    const qrMatrixData = qrCode.modules.data;
    const cellSize = qrSize / qrMatrixSize;

    // Zone blanche de sécurité sous le QR code
    doc.rect(x - 2, y - 2, qrSize + 4, qrSize + 4).fill('#ffffff');

    // Dessine les carrés du QR code en vectoriel
    doc.fillColor('#000000');
    for (let r = 0; r < qrMatrixSize; r++) {
      for (let c = 0; c < qrMatrixSize; c++) {
        if (qrMatrixData[r * qrMatrixSize + c]) {
          const mx = x + c * cellSize;
          const my = y + r * cellSize;
          doc.rect(mx, my, cellSize + 0.03, cellSize + 0.03).fill();
        }
      }
    }

    // Label nominatif centré sous le QR code
    doc.fillColor('#1c1c1c');
    doc.font('Helvetica-Bold').fontSize(8);
    const displayName = slug === 'accueil' ? 'ACCUEIL' : slug.replace(/-/g, ' ').toUpperCase();
    doc.text(displayName, x - 15, y + qrSize + 8, {
      width: qrSize + 30,
      align: 'center'
    });

    index++;
  }

  // Bas de page
  doc.fillColor('#999999').font('Helvetica').fontSize(8).text('Généré le ' + new Date().toLocaleDateString('fr-FR') + ' • paris-en-chanteurs.fr', 0, 810, { align: 'center' });

  doc.end();

  await new Promise((resolve) => writeStream.on('finish', resolve));
  console.log(`Fichier PDF global généré avec succès : ${pdfOutputPath}`);
}

main().catch(err => {
  console.error("Erreur de génération :", err);
  process.exit(1);
});
