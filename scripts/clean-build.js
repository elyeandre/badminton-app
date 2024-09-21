const path = require('path');
const fs = require('fs');

// directories to operate on
const publicDir = path.resolve(__dirname, '../public');
const buildDir = path.resolve(__dirname, '../build');

// function to delete files with specific extensions in a directory, ignoring specified files
const deleteFilesWithExtension = (dir, extensions, excludeFiles = []) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      process.exit(1);
    }

    const filesToDelete = files.filter((file) => {
      return extensions.some((ext) => file.endsWith(ext)) && !excludeFiles.includes(file);
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

// function to delete a directory recursively
const deleteDirectory = (dir) => {
  fs.rm(dir, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(`Error deleting directory ${dir}:`, err);
    } else {
      console.log(`Deleted directory: ${dir}`);
    }
  });
};

deleteFilesWithExtension(publicDir, ['.css', '.js'], ['error.css']); // Exclude error.css
deleteDirectory(buildDir);
