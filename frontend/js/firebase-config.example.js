(function () {
  window.ZCORE_FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  };

  window.initZCoreFirebase = function initZCoreFirebase() {
    if (typeof firebase === 'undefined' || !window.ZCORE_FIREBASE_CONFIG) {
      return null;
    }

    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(window.ZCORE_FIREBASE_CONFIG);
    }

    return firebase.apps[0] || null;
  };
})();
