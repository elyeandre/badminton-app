const cron = require('node-cron');
const Blacklist = require('../models/Blacklist');

// function to delete expired tokens
const deleteExpiredTokens = async () => {
  try {
    const currentTime = new Date();

    // Find and delete expired tokens
    const result = await Blacklist.deleteMany({ expiresAt: { $lt: currentTime } });
    console.log(`Deleted expired tokens: ${result.deletedCount}`);
  } catch (err) {
    console.error('Error deleting expired tokens:', err);
  }
};

// cron job to run every 5 minutes
const startTokenCleanupCronJob = () => {
  cron.schedule('*/2 * * * *', () => {
    console.log('Running cron job to delete expired tokens...');
    deleteExpiredTokens();
  });
  console.log('Cron job scheduled to clean expired tokens every 2 minutes.');
};

module.exports = {
  startTokenCleanupCronJob
};
