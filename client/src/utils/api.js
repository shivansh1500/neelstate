// Utility function to get the full API URL
export const getApiUrl = (endpoint) => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return apiUrl ? `${apiUrl}${endpoint}` : endpoint;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth
  SIGNUP: '/api/auth/signup',
  SIGNIN: '/api/auth/signin',
  GOOGLE: '/api/auth/google',
  SIGNOUT: '/api/auth/signout',
  
  // Listings
  LISTINGS: '/api/listing/get',
  CREATE_LISTING: '/api/listing/create',
  UPDATE_LISTING: (id) => `/api/listing/update/${id}`,
  DELETE_LISTING: (id) => `/api/listing/delete/${id}`,
  GET_LISTING: (id) => `/api/listing/get/${id}`,
  
  // Users
  GET_USER: (id) => `/api/user/${id}`,
  UPDATE_USER: (id) => `/api/user/update/${id}`,
  DELETE_USER: (id) => `/api/user/delete/${id}`,
  USER_LISTINGS: (id) => `/api/user/listing/${id}`,
  
  // Payments
  CREATE_PAYMENT_INTENT: (id) => `/api/payment/create-payment-intent/${id}`,
  CONFIRM_PAYMENT: (id) => `/api/payment/confirm-payment/${id}`,
  PURCHASED_LISTINGS: (id) => `/api/payment/purchased-listings/${id}`,
  SOLD_LISTINGS: (id) => `/api/payment/sold-listings/${id}`,
  REFUND_PAYMENT: (id) => `/api/payment/refund/${id}`,
}; 