const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function main() {
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  const pdfOutputPath = path.join(__dirname, 'QR', 'urls-list.pdf');

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

  console.log(`Génération du PDF de la liste des ${urls.length} URLs...`);

  // Initialise le document PDF au format A4 avec des marges de 60pt (environ 2,1cm)
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 60, right: 60 }
  });

  const writeStream = fs.createWriteStream(pdfOutputPath);
  doc.pipe(writeStream);

  // Fond de page blanc
  doc.rect(0, 0, 595.28, 841.89).fill('#ffffff');

  // Titres en haut de page
  doc.fillColor('#005c41'); // Couleur verte principale foncée
  doc.font('Helvetica-Bold').fontSize(22).text('Paris en chanteurs', 60, 60);
  doc.fillColor('#1c1c1c').font('Helvetica-Bold').fontSize(14).text('Liste complète des URLs du sitemap', 60, 88);
  doc.fillColor('#555555').font('Helvetica-Oblique').fontSize(8.5).text('Généré le ' + new Date().toLocaleDateString('fr-FR') + ' • Planche de référence technique', 60, 108);

  // Ligne de séparation
  doc.moveTo(60, 122).lineTo(535.28, 122).strokeColor('#e6f6f1').lineWidth(2).stroke();

  let y = 145;
  
  for (const url of urls) {
    // Extrait le slug pour un affichage lisible
    let cleanUrl = url.replace(/\/$/, "");
    const parts = cleanUrl.split('/');
    const lastPart = parts[parts.length - 1];
    let slug = 'accueil';
    if (lastPart && !lastPart.includes('paris-en-chanteurs.fr')) {
      slug = lastPart;
    }

    const displayName = slug === 'accueil' ? "Page d'accueil" : slug.replace(/-/g, ' ');
    const formattedName = displayName.replace(/\b\w/g, c => c.toUpperCase());

    // Puce verte
    doc.fillColor('#009f70').font('Helvetica-Bold').fontSize(11).text('• ', 60, y);
    
    // Nom de la page
    doc.fillColor('#1c1c1c').font('Helvetica-Bold').fontSize(11).text(`${formattedName} :`, 72, y);

    // URL cliquable
    doc.fillColor('#005c41').font('Helvetica').fontSize(10).text(url, 72, y + 15, {
      link: url,
      underline: true
    });

    y += 44;
  }

  // Ligne de pied de page
  doc.moveTo(60, 780).lineTo(535.28, 780).strokeColor('#e6f6f1').lineWidth(1).stroke();
  doc.fillColor('#999999').font('Helvetica').fontSize(8).text('Document technique de référence • paris-en-chanteurs.fr', 0, 792, { align: 'center' });

  doc.end();

  await new Promise((resolve) => writeStream.on('finish', resolve));
  console.log(`PDF généré avec succès : ${pdfOutputPath}`);
}

main().catch(err => {
  console.error("Erreur de génération du PDF :", err);
  process.exit(1);
});
