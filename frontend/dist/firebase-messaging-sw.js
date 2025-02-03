
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize Firebase app
firebase.initializeApp({
  apiKey: "AIzaSyDsi2i-V91bw_4yYSVNGbkdV9KjejGa6eY",
  authDomain: "ees121-47d74.firebaseapp.com",
  projectId: "ees121-47d74",
  storageBucket: "ees121-47d74.appspot.com",
  messagingSenderId: "39793981073",
  appId: "1:39793981073:web:e07f252cdb0513758ef130",
  measurementId: "G-RML24DDFKR"
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions)
    .catch(error => {
      console.error("Error showing notification:", error);
    });
});
