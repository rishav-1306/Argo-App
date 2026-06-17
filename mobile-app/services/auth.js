import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@argo_token',
  USER: '@argo_user',
};

export const saveToken = async (token) => {
  await AsyncStorage.setItem(KEYS.TOKEN, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(KEYS.TOKEN);
};

export const saveUser = async (user) => {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const getUser = async () => {
  const data = await AsyncStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const logout = async () => {
  await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
};

export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token;
};
