const fs = require('fs');
const fileContent = fs.readFileSync('c:/Users/yu-tanioka/WebApps/37_SnapRender/docs/diagrams/04_component_architecture.md', 'utf8');

let mermaidCode = '';
let codeLang = 'mermaid';

const startIdx = fileContent.indexOf('```');
if (startIdx !== -1) {
  const nextNewline = fileContent.indexOf('\n', startIdx);
  if (nextNewline !== -1) {
    const langLine = fileContent.substring(startIdx + 3, nextNewline).replace(/\r/g, '').trim();
    codeLang = langLine || 'mermaid';
    
    const endIdx = fileContent.indexOf('```', nextNewline + 1);
    if (endIdx !== -1) {
      mermaidCode = fileContent.substring(nextNewline + 1, endIdx).trim();
    }
  }
}

console.log('Lang:', codeLang);
console.log('Code length:', mermaidCode.length);
