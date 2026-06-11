/* Firebase initialization — Auth + Firestore (compat SDK, no build step) */
(function () {
  var firebaseConfig = {
    apiKey: "AIzaSyDekESQkNZT32stxolqu6_tl8FQAQWsu0s",
    authDomain: "clerk-tools-51421.firebaseapp.com",
    projectId: "clerk-tools-51421",
    storageBucket: "clerk-tools-51421.firebasestorage.app",
    messagingSenderId: "398413402945",
    appId: "1:398413402945:web:4343a69472c8667e5ec7c0",
  };

  firebase.initializeApp(firebaseConfig);
  window.fbAuth = firebase.auth();
  window.fbDb = firebase.firestore();

  // Secondary app: lets an admin create accounts (or visitors register)
  // without disturbing the primary signed-in session.
  window.fbSecondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
})();
