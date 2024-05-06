export const isDevelopment = () => {
  return process.env.REACT_APP_DEBUG_MODE === "true";
};

export const debugLog = (message, ...additionalData) => {
  if (isDevelopment()) {
    console.log(`[Debug] ${message}`, ...additionalData);
  }
};
