export const fetchWrapper = async (url, options = {}) => {
  const fetchOptions = {
    ...options,
    credentials: options.credentials || 'include',
  };

  let response = await fetch(url, fetchOptions);

  // If unauthorized, try to refresh token
  if (response.status === 401 || response.status === 403) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const refreshResponse = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // Retry original request
        response = await fetch(url, fetchOptions);
      } else {
        // If refresh fails (e.g. refresh token expired), we might want to dispatch a logout action
        // For now, we just return the failed response and let the caller handle it
      }
    } catch (error) {
      console.error('Failed to refresh token', error);
    }
  }

  return response;
};
