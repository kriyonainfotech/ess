import React, { createContext, useState, useEffect } from "react";
import { getFcmToken, onMessageListener } from "../Firebaseconfig";
import axios from "axios";

const backend_API = import.meta.env.VITE_API_URL;

// Create and export the context
export const FCMContext = createContext();

// Export the provider component
export const FCMProvider = ({ children }) => {
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getFcmToken();
      if (token) {
        setFcmToken(token);
        // Get the authentication token from localStorage
        const authToken = JSON.parse(localStorage.getItem('token'));

        try {
          await axios.post(
            `${backend_API}/save-fcm-token`,
            { token },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              }
            }
          );
        } catch (error) {
          console.error("Error saving FCM token:", error);
        }
      }
    };

    fetchToken();

    // Set up message listener
    onMessageListener()
      .then((payload) => {
        console.log("New message:", payload);
      })
      .catch((err) => console.error("Failed to set up message listener:", err));
  }, []);

  return (
    <FCMContext.Provider value={{ fcmToken }}>
      {children}
    </FCMContext.Provider>
  );
};
