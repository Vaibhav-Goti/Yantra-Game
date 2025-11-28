// Get tokens from localStorage
export const getAccessToken = () => localStorage.getItem("authToken");
// Refresh token is now stored in httpOnly cookie, not accessible via JavaScript
// This function is kept for backward compatibility but won't be used
export const getRefreshToken = () => null;

// Save new tokens
export const saveAccessToken = (accessToken) => {
  if (accessToken) localStorage.setItem("authToken", accessToken);
};

// Refresh token is now stored in httpOnly cookie by backend
// This function is kept for backward compatibility but won't save to localStorage
export const saveRefreshToken = (refreshToken) => {
  // Refresh token is automatically stored in httpOnly cookie by backend
  // No need to store in localStorage for security
};

// Clear tokens and logout
export const clearTokens = () => {
  localStorage.removeItem("authToken");
  // Refresh token cookie will be cleared by backend on logout
};