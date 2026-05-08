const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace message.reply('text') or message.reply("text")
    // Watch out for template literals, we can ignore them or handle simple ones.
    const regex = /message\.reply\(['"]([^'"]+)['"]\)/g;
    
    let needsUI = false;
    
    content = content.replace(regex, (match, text) => {
        needsUI = true;
        // Check if it's a success message
        if (text.includes('âś…') || text.toLowerCase().includes('pomyĹ›lnie') || text.toLowerCase().includes('zaktualizowano') || text.toLowerCase().includes('wyczyszczono')) {
            let cleanText = text.replace(/âś…\s*/, '');
            return `message.reply({ embeds: [UI.success('${cleanText}')] })`;
        }
        
        let cleanText = text.replace(/âťŚ\s*/, '');
        return `message.reply({ embeds: [UI.error('${cleanText}')] })`;
    });

    if (needsUI && !content.includes("require('../../utils/UI')") && !content.includes("require('../utils/UI')")) {
        // Find where requires are
        const depth = filePath.split(path.sep).length - path.join(__dirname, 'commands').split(path.sep).length;
        let reqPath = '../../utils/UI';
        if (depth === 1) reqPath = '../utils/UI';
        
        content = `const UI = require('${reqPath}');\n` + content;
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

processDirectory(path.join(__dirname, 'commands'));
