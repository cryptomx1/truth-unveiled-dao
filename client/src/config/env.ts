// Environment configuration for Phase IV
// Workaround for accessing environment variables in browser context

interface EnvConfig {
  PINATA_API_KEY: string;
  PINATA_SECRET_KEY: string;
}

// Function to get environment variables from server if needed
export const getEnvConfig = async (): Promise<EnvConfig> => {
  // For development, try to get from import.meta.env first
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY;
  
  if (apiKey && secretKey) {
    return {
      PINATA_API_KEY: apiKey,
      PINATA_SECRET_KEY: secretKey
    };
  }
  
  // Fallback: try to fetch from a server endpoint
  try {
    const response = await fetch('/api/env-config');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Unable to fetch environment config from server');
  }
  
  // Return empty config for simulation mode
  return {
    PINATA_API_KEY: '',
    PINATA_SECRET_KEY: ''
  };
};

// Synchronous access for immediate use (simulation mode if not available)
export const getEnvConfigSync = (): EnvConfig => {
  return {
    PINATA_API_KEY: import.meta.env.VITE_PINATA_API_KEY || '',
    PINATA_SECRET_KEY: import.meta.env.VITE_PINATA_SECRET_KEY || ''
  };
};