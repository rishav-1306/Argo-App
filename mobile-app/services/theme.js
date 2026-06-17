// Argo App Theme
export const COLORS = {
  primary: '#90A955',
  primaryLight: '#ECF39E',
  dark: '#132A13',
  darkGreen: '#4F772D',
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
  text: '#2D2D2D',
  error: '#E63946',
  success: '#4F772D',
  warning: '#F4A261',
  border: '#E0E0E0',
  placeholder: '#9E9E9E',
  cardBg: '#FFFFFF',
  shadow: '#000000',
};

export const FONTS = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};

export const API_BASE_URL = 'https://argo-app-api.vercel.app/api'; // Vercel production
// export const API_BASE_URL = 'http://192.168.31.199:5000/api'; // Local development (physical device)
// export const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator
// export const API_BASE_URL = 'http://localhost:5000/api'; // Web / iOS simulator
