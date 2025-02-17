const axios = require("axios");

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

const sendNotification = async (receiverPlayerId, message) => {
  const notificationData = {
    app_id: ONESIGNAL_APP_ID,
    include_player_ids: [receiverPlayerId],
    headings: { en: "New Notification" },
    contents: { en: message },
  };

  await axios.post(
    "https://onesignal.com/api/v1/notifications",
    notificationData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_API_KEY}`,
      },
    }
  );
};

module.exports = sendNotification;
