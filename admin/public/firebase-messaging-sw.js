// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
    apiKey: "AIzaSyDflOivHoHAC7HCg-IiQF9bTH39fLSU3DU",
    authDomain: "push-notification-ef5c5.firebaseapp.com",
    projectId: "push-notification-ef5c5",
    storageBucket: "push-notification-ef5c5.appspot.com",
    messagingSenderId: "1076373369960",
    appId: "1:1076373369960:web:2dc5990170af261cb6b7dd",
    measurementId: "G-TXY811QL70"
  };


// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  // eslint-disable-next-line no-restricted-globals
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});