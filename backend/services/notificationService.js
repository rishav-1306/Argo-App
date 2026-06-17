const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
    console.log('Invalid push token:', pushToken);
    return null;
  }

  const messages = [
    {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
    },
  ];

  try {
    const chunks = expo.chunkPushNotifications(messages);
    const results = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      results.push(...ticketChunk);
    }

    return results;
  } catch (error) {
    console.error('Push notification error:', error.message);
    return null;
  }
};

const sendBulkNotifications = async (tokens, title, body, data = {}) => {
  const validTokens = tokens.filter((t) => t && Expo.isExpoPushToken(t));

  if (validTokens.length === 0) return [];

  const messages = validTokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  try {
    const chunks = expo.chunkPushNotifications(messages);
    const results = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      results.push(...ticketChunk);
    }

    return results;
  } catch (error) {
    console.error('Bulk push notification error:', error.message);
    return [];
  }
};

module.exports = { sendPushNotification, sendBulkNotifications };
