const config = require('config');
const { randomBytes } = require('crypto');
const { log, error } = console;

// function to upload a file to Cloudflare R2
const uploadToR2 = async (fileData, originalFileName) => {
  try {
    // extract the file extension from the original filename
    const fileExtension = (originalFileName.match(/\.[^/.]+$/) || [])[0] || '';

    // generate a random filename with a specific length (e.g., 16 bytes) and convert it to hex
    const randomFileName = randomBytes(16).toString('hex') + fileExtension;

    const uploadUrl = `${config.get('r2').uploadUrl}/${randomFileName}`;

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: fileData,
      headers: {
        'X-Custom-Auth-Key': config.get('r2').authKey,
        'Content-Type': 'application/octet-stream'
      }
    });

    if (!response.ok) {
      error(`File upload failed with status ${response.status}`);
    }
    return { fileUrl: uploadUrl };
  } catch (err) {
    error('File upload failed:', err);
  }
};

// function to delete a file from Cloudflare R2
const deleteFromR2 = async (fileName) => {
  try {
    const deleteUrl = `${config.get('r2').uploadUrl}/${fileName}`;

    // Delete the file using Fetch
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'X-Custom-Auth-Key': config.get('r2').authKey
      }
    });

    if (!response.ok) {
      throw new Error(`File deletion failed with status ${response.status}`);
    }

    return { message: 'File deleted successfully' };
  } catch (err) {
    error('File deletion failed:', err);
  }
};

module.exports = {
  uploadToR2,
  deleteFromR2
};