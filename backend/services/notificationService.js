// Dynamic import for ESM-only expo-server-sdk
let ExpoClient = null;

const getExpo = async () => {
  if (!ExpoClient) {
    try {
      const mod = await import('expo-server-sdk');
      ExpoClient = new mod.Expo();
    } catch (e) {
      console.log('expo-server-sdk not available, push notifications disabled');
      return null;
    }
  }
  return ExpoClient;
};

const isExpoPushToken = (token) => {
  return typeof token === 'string' && /^\w{2,}:\w+/.test(token);
};

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken || !isExpoPushToken(pushToken)) {
    return null;
  }

  const expo = await getExpo();
  if (!expo) return null;

  const messages = [{ to: pushToken, sound: 'default', title, body, data }];

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
  const validTokens = tokens.filter((t) => t && isExpoPushToken(t));
  if (validTokens.length === 0) return [];

  const expo = await getExpo();
  if (!expo) return [];

  const messages = validTokens.map((token) => ({ to: token, sound: 'default', title, body, data }));

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
