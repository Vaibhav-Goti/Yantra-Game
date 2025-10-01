// Get tokens from localStorage
export const getAccessToken = () => localStorage.getItem("authToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

// Save new tokens
export const saveAccessToken = (accessToken) => {
  if (accessToken) localStorage.setItem("authToken", accessToken);
};

export const saveRefreshToken = (refreshToken) => {
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

// Clear tokens and logout
export const clearTokens = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
};