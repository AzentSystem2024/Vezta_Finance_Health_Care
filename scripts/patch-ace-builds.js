const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'node_modules', 'ace-builds', 'css', 'theme', 'ambiance.css');

if (fs.existsSync(cssPath)) {
  let content = fs.readFileSync(cssPath, 'utf8');
  if (content.includes('linear-gradient(left,')) {
    content = content.replace(/linear-gradient\(left,/g, 'linear-gradient(to left,');
    fs.writeFileSync(cssPath, content, 'utf8');
    console.log('Successfully patched ace-builds CSS warning.');
  }
} else {
  console.log('ace-builds css not found, skipping patch.');
}
