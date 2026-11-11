const API_URL = import.meta.env.VITE_API_URL;

// GET request
export const getApiStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/`);

    if (!response.ok) {
      throw new Error("Backend connection failed");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
