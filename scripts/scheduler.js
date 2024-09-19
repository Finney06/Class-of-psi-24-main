const { schedule } = require('node-cron');
const { sendBirthdayMessages } = require('./bot.js');

// Schedule the function to run daily at midnight
schedule('0 0 * * *', () => {
  sendBirthdayMessages();
  console.log('Scheduled task executed.');
});