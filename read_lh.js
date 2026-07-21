const fs = require('fs');
const report = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));

console.log('--- FIRST 15 COLOR CONTRAST ISSUES ---');
const contrast = report.audits['color-contrast'];
if (contrast && contrast.details && contrast.details.items) {
  contrast.details.items.slice(0, 15).forEach((item, idx) => {
    console.log(`${idx + 1}. Node: ${item.node.nodeLabel}`);
    console.log(`Explanation: ${item.node.explanation || 'N/A'}`);
    console.log(`Snippet: ${item.node.snippet}`);
    console.log('---');
  });
}
