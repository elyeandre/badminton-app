const path = require('path');
const fs = require('fs');

// directories to operate on
const htmlDir = path.resolve(__dirname, 'src/html');
const publicDir = path.resolve(__dirname, 'public');

// function to delete files with specific extensions in a directory
const deleteFilesWithExtension = (dir, extensions) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      process.exit(1);
    }

    const filesToDelete = files.filter((file) => {
      return extensions.some((ext) => file.endsWith(ext));
    });

    filesToDelete.forEach((file) => {
      const filePath = path.join(dir, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${file}:`, err);
        } else {
          console.log(`Deleted: ${file}`);
        }
      });
    });
  });
};

const deleteHtmlFiles = (dir, excludePattern) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      process.exit(1);
    }

    const filesToDelete = files.filter((file) => {
      return file.endsWith('.html') && !file.includes(excludePattern);
    });

    filesToDelete.forEach((file) => {
      const filePath = path.join(dir, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${file}:`, err);
        } else {
          console.log(`Deleted: ${file}`);
        }
      });
    });
  });
};

deleteHtmlFiles(htmlDir, 'body-content');
deleteFilesWithExtension(publicDir, ['.css', '.js']);
