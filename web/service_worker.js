// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/5.1.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.1.0/firebase-messaging.js');
// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyDftRz386f1meMIyt5aoIQNyAcPRHQwwwA",
    authDomain: "comeety-a829a.firebaseapp.com",
    databaseURL: "https://comeety-a829a.firebaseio.com",
    projectId: "comeety-a829a",
    storageBucket: "comeety-a829a.appspot.com",
    messagingSenderId: "148618790274"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
// [END initialize_firebase_in_sw]

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[service_worker.js] Received background message ', payload);

    // Customize notification here
    var notificationTitle = payload.data.title;
    var notificationOptions = {
        body: payload.data.body,
        icon: '/apple-touch-icon.png',
        data: {
            click_action: payload.data.click_action
        },
        requireInteraction: true
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.notification.data.click_action) {
        url = event.notification.data.click_action;
    } else {
        url = '/events';
    }

    event.waitUntil(
        clients.openWindow(url)
            .then(function(WindowClient) {
            // Faire quelque chose avec le WindowClient
        }).catch(function(error) {
            console.log(error);
        })
    );
});
