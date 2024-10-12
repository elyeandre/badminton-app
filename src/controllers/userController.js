const User = require('../models/User');
const File = require('../models/File');
const { assignFileAccess } = require('../utils/assignFileAccess');
const { log, error } = console;
const { uploadToR2, deleteFromR2, getFileFromR2 } = require('../services/r2Service');
const mongoose = require('mongoose');
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);
const mime = require('mime-types');
const fileType = require('file-type-cjs');

exports.getCurrentUser = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('+isAdmin'); // Select the isAdmin field

    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'User not found'
      });
    }

    // if the user is an admin, populate the court field
    if (user.isAdmin) {
      user = await user.populate('court');
    }

    // Send the user object, with court info if admin
    res.json(user);
  } catch (err) {
    error('Error occurred while fetching current user:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the userId is missing
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'User not found'
      });
    }

    res.json(user);
  } catch (err) {
    console.error('Error occurred while fetching user by ID:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};

exports.updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    // safely extract the uploaded file and password
    const profile_photo = req.files?.profile_photo;
    const password = req.body.password;
    const newEmail = req.body.email;

    // retrieve the user's current profile
    const user = await User.findById(userId);

    // Check if the new email is the same as the old email
    if (newEmail && newEmail === user.email) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'The new email must be different from the current email.'
      });
    }

    // Check if the new password is the same as the old password
    if (password && password === user.password) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'The new password must be different from the current password.'
      });
    }

    // check if profile_photo is provided and handle the upload
    let fileUrl;
    if (profile_photo) {
      // Check file size limit (e.g., 5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
      if (profile_photo.size > MAX_SIZE) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'File size exceeds the limit of 5MB.'
        });
      }

      // check the file's MIME type using file-type
      const fileBuffer = profile_photo.data;
      const type = await fileType.fromBuffer(fileBuffer);
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

      if (!type || !allowedMimeTypes.includes(type.mime)) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Invalid file type. Only images are allowed.'
        });
      }

      // delete the existing profile photo from Cloudflare R2 if present
      if (user.profile_photo) {
        const fileName = user.profile_photo.split('/').pop(); // Extract the file name from the URL
        await deleteFromR2(fileName); // Delete the old photo
      }

      // upload the new file to Cloudflare R2
      const uploadResult = await uploadToR2(profile_photo.data, profile_photo.name);
      const fileName = uploadResult.fileName;
      fileUrl = `/user/data/${fileName}`;

      // assign access permissions for the new profile photo
      const accessibleUsers = [userId]; // User who uploaded should have access

      const file = new File({
        fileName: uploadResult.fileName,
        owner: userId // The ID of the user who owns this file
      });

      await assignFileAccess(file, userId, [], accessibleUsers);
    }

    // Update user's fields
    if (req.body) {
      Object.assign(user, req.body);
    }

    // Update profile photo URL if it was uploaded
    if (fileUrl) {
      user.profile_photo = fileUrl;
    }

    // If the password is being updated, the pre-save hook will hash it
    if (password) {
      user.password = password;
    }

    // Set email verification to false if the email is being updated
    if (newEmail) {
      user.email = newEmail;
    }

    // Save the user, triggering the pre-save hook
    await user.save();

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'User information updated successfully',
      user
    });
  } catch (err) {
    console.error(err);
    if (err instanceof mongoose.Error.StrictModeError) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Invalid fields in the request.'
      });
    }
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};
exports.serveData = async (req, res) => {
  const { filename } = req.params;

  try {
    // fetch file stream from R2
    const fileStream = await getFileFromR2(filename);

    if (!fileStream) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    // Set the correct Content-Type based on the file extension
    const mimeType = mime.lookup(filename) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    // enable if we want to directive forces the browser to treat the file as something should be downloaded
    // res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // pipe file stream to response
    await pipelineAsync(fileStream, res);
  } catch (err) {
    error('Error fetching file:', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal Server Error'
    });
  }
};
