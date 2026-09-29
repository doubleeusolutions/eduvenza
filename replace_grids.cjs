const fs = require('fs');
const path = require('path');
const dir = './src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace fixed 2 columns grid
  content = content.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'1fr 1fr',\s*gap:\s*'[^']+'\s*\}\}/g, 'className="grid-2col"');
  // Replace fixed 3 columns grid
  content = content.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'repeat\(3,\s*1fr\)',\s*gap:\s*'[^']+'\s*\}\}/g, 'className="grid-3col"');
  content = content.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'1fr 1fr 1fr',\s*gap:\s*'[^']+'\s*\}\}/g, 'className="grid-3col"');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  }
}
