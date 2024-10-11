const { assignFileAccess } = require('./assignFileAccess');
/**
 * Assigns access permissions to a file for the admin.
 * @param {Object} file - The file document to which access will be assigned.
 * @param {ObjectId} adminId - The ID of the admin user who will own the file.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 * @throws {Error} - Throws an error if the assignment fails.
 */
const assignFileToAdmin = async (file, adminId) => {
  const accessibleUsers = [adminId]; // User who uploaded should have access
  await assignFileAccess(file, adminId, [], accessibleUsers);
};

module.exports = {
  assignFileToAdmin
};
