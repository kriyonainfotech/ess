importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase app in service worker with hardcoded config
const firebaseConfig = {
  apiKey: "AIzaSyDsi2i-V91bw_4yYSVNGbkdV9KjejGa6eY",
  authDomain: "ees121-47d74.firebaseapp.com",
  projectId: "ees121-47d74",
  storageBucket: "ees121-47d74.firebasestorage.app",
  messagingSenderId: "39793981073",
  appId: "1:39793981073:web:e07f252cdb0513758ef130",
  measurementId: "G-RML24DDFKR",
};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png",
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
