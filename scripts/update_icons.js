const fs = require('fs');
const path = require('path');

const dir = 'd:/Bank app/super-admin-web/src/pages/dashboard';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  const replaceActionIcon = (content, iconName, newClass) => {
    const oldClasses = [
      'text-gray-400 hover:text-gray-700 transition-colors',
      'text-gray-400 hover:text-blue-500 transition-colors',
      'text-gray-400 hover:text-red-500 transition-colors',
      'text-gray-500 hover:text-gray-800 transition-colors',
      'text-[#ff3d67] hover:text-[#e02e55] transition-colors',
      'text-[#1cabb1] hover:text-[#168f94] transition-colors',
      'text-gray-800 hover:text-blue-500 transition-colors',
      'text-red-500 hover:text-red-600 transition-colors'
    ];
    
    oldClasses.forEach(old => {
      const safeOld = old.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp('className="' + safeOld + '"([^>]*?>\\s*<' + iconName + '\\b)', 'g');
      content = content.replace(regex, 'className="' + newClass + '"$1');
    });
    return content;
  };

  content = replaceActionIcon(content, 'Eye', 'text-gray-800 hover:text-blue-500 transition-colors');
  content = replaceActionIcon(content, 'Edit', 'text-gray-800 hover:text-blue-500 transition-colors');
  content = replaceActionIcon(content, 'Trash2', 'text-red-500 hover:text-red-600 transition-colors');

  if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + file);
  }
});
