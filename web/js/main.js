language_level = {"1": 'Beginner', "2": "Elementary", "3": 'Medium', "4": 'Fluent', "5":'Native'};

firebase.initializeApp({
    apiKey: "AIzaSyDftRz386f1meMIyt5aoIQNyAcPRHQwwwA",
    authDomain: "comeety-a829a.firebaseapp.com",
    databaseURL: "https://comeety-a829a.firebaseio.com",
    projectId: "comeety-a829a",
    storageBucket: "comeety-a829a.appspot.com",
    messagingSenderId: "148618790274"
});

let messaging;
try {
    messaging = firebase.messaging();
} catch(err) {
    console.log(err);
}

$(document).ready(function() {
    $('.modal').modal({dismissible: true, opacity: .5});

    $(".button-collapse").sideNav();

    $('#appNotificationEnabler').click(function(event) {
        event.preventDefault;
        updateUIForPushPermissionRequired();
    });

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 90, // Creates a dropdown of 15 years to control year,
        format: 'dddd, dd mmm, yyyy',
        formatSubmit: 'yyyy-mm-dd',
        onSet: function( arg ){
            if ( 'select' in arg ){ //prevent closing on selecting month/year
                this.close();
            }
        },
        hiddenName: true,
        min: new Date()

    });

    $('.timepicker').pickatime({
        autoclose: false,
        twelvehour: false
    });

    $('select').material_select();

    jQuery.timeago.settings.allowFuture = true;

    if (navigator && navigator.serviceWorker) {
        registerServiceWorker();
    }


    if(typeof messaging !== "undefined") {

        $('.logout_trigger').click(function(event) {
            event.preventDefault;
            drift.reset();
            deleteToken();
        });
        // [END get_messaging_object]
        // [START set_public_vapid_key]
        // Add the public key generated from the console here.
        messaging.usePublicVapidKey('BB0yt9x_9cUjwybYwKCfGW4Tchh37Pe-BxBkXIwMzAUho20ZF7WT4qFnHhInegFPtnk2__IsFl6W6sB6BdUa6Vk');
        // [END set_public_vapid_key]

        // [START refresh_token]
        // Callback fired if Instance ID token is updated.
        messaging.onTokenRefresh(function () {
            messaging.getToken().then(function (refreshedToken) {
                console.log('Token refreshed.');
                // Indicate that the new Instance ID token has not yet been sent to the
                // app server.
                setTokenSentToServer(false);
                // Send Instance ID token to app server.
                sendTokenToServer(refreshedToken);
                // [START_EXCLUDE]
                // Display new Instance ID token and clear UI of all previous messages.
                resetUI();
                // [END_EXCLUDE]
            }).catch(function (err) {
                console.log('Unable to retrieve refreshed token ', err);
                showToken('Unable to retrieve refreshed token ', err);
            });
        });
        // [END refresh_token]
        // [START receive_message]
        // Handle incoming messages. Called when:
        // - a message is received while the app has focus
        // - the user clicks on an app notification created by a service worker
        //   `messaging.setBackgroundMessageHandler` handler.
        messaging.onMessage(function (payload) {
            console.log('Message received. ', payload);
            // [START_EXCLUDE]
            // Update the UI to include the received message.
            //appendMessage(payload);
            // [END_EXCLUDE]
        });

        if (currentUserId !== null && !isDisplayPushPermissionAccepted() && isPushPermissionRequestPending()) {
            $('#appNotificationEnablerBlock').removeClass('hide');
        }

        //if user is loggued
        if (currentUserId !== null) {
            resetUI();
        }
    }
});

String.prototype.nl2br = function()
{
    return this.replace(/\n/g, "<br />");
}

function refreshAuthenticationToken() {
    previousAuthenticationCallTimestamp = localStorage.getItem('authenticationRefreshCallTimestamp');
    
    if(currentUserId != null &&
        (previousAuthenticationCallTimestamp === null
        || (Date.now() - previousAuthenticationCallTimestamp) > 3600000)
    ) {
        ApiClient1.get(
            '/refresh-token-cookie',
            null,
            function(msg){
                localStorage.setItem('authenticationRefreshCallTimestamp', JSON.stringify(Date.now()));
            }
        );
    }

}

function registerServiceWorker() {
    navigator.serviceWorker
        .register('/service_worker.js', {scope: '/'})
        .then(registration => {
        console.log(
        "ServiceWorker registered with scope:",
        registration.scope
    );

    if(typeof messaging !== "undefined") {
        messaging.useServiceWorker(registration);
    }

})
.catch(e => console.error("ServiceWorker failed:", e));

}



// [END receive_message]
function resetUI() {
    clearMessages();

    if(isDisplayPushPermissionAccepted()) {
        showToken('loading...');
        // [START get_token]
        // Get Instance ID token. Initially this makes a network call, once retrieved
        // subsequent calls to getToken will return from cache.
        messaging.getToken().then(function (currentToken) {
            if (currentToken) {
                sendTokenToServer(currentToken);
                updateUIForPushEnabled(currentToken);
            } else {
                // Show permission request.
                console.log('No Instance ID token available. Request permission to generate one.');
                // Show permission UI.
                updateUIForPushPermissionRequired();
                setTokenSentToServer(false);
            }
        }).catch(function (err) {
            console.log('An error occurred while retrieving token. ', err);
            showToken('Error retrieving Instance ID token. ', err);
            setTokenSentToServer(false);
        });
        // [END get_token]
    }
}

function showToken(currentToken) {
    console.log('token: '+currentToken);
}

// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer()) {
        console.log('Sending token to server...');
        // DONE(developer): Send the current token to your server.
        ApiClient1.post(
            '/user/app_notifications_tokens',
            {'token': currentToken},
            function(xhr) {
                if(xhr.status === 204 || xhr.status === 201) {
                    setTokenSentToServer(true);
                }
            }
        );
    } else {
        console.log('Token already sent to server so won\'t send it again ' +
            'unless it changes');
    }
}
function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === '1';
}
function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function isPushPermissionRequestPending(accept) {
    return window.localStorage.getItem('pushPermissionAccepted') === null;
}
function isDisplayPushPermissionAccepted() {
    return window.localStorage.getItem('pushPermissionAccepted') === '1';
}
function setPushPermissionAccepted(accept) {
    window.localStorage.setItem('pushPermissionAccepted', accept ? '1' : '0');
}

function resetPushPermissionAccepted(){
    window.localStorage.removeItem('pushPermissionAccepted');
}

function showHideDiv(divId, show) {
    const div = document.querySelector('#' + divId);
    if (show) {
        div.style = 'display: visible';
    } else {
        div.style = 'display: none';
    }
}
function requestPermission() {
    console.log('Requesting permission...');
    // [START request_permission]
    messaging.requestPermission().then(function() {
        console.log('Notification permission granted.');
        // TODO(developer): Retrieve an Instance ID token for use with FCM.
        // [START_EXCLUDE]
        // In many cases once an app has been granted notification permission, it
        // should update its UI reflecting this.
        resetUI();
        // [END_EXCLUDE]
    }).catch(function(err) {
        console.log('Unable to get permission to notify.', err);
        if(err.code === 'messaging/permission-blocked') {
            alert('Notifications from comeety are blocked in your browser settings.');
            resetPushPermissionAccepted();
        }

    });
    // [END request_permission]
}
function deleteToken() {
    // Delete Instance ID token.
    // [START delete_token]
    messaging.getToken().then(function(currentToken) {
        messaging.deleteToken(currentToken).then(function() {
            console.log('Token deleted.');

            ApiClient1.delete(
                '/user/app_notifications_tokens',
                {'token': currentToken},
                function(xhr) {
                    if(xhr.status === 204) {
                        console.log('token successfully deleted');
                    }
                }
            );

            setTokenSentToServer(false);
            resetPushPermissionAccepted();

            // [START_EXCLUDE]
            // Once token is deleted update UI.
            resetUI();
            // [END_EXCLUDE]
        }).catch(function(err) {
            console.log('Unable to delete token. ', err);
        });
        // [END delete_token]
    }).catch(function(err) {
        console.log('Error retrieving Instance ID token. ', err);
        showToken('Error retrieving Instance ID token. ', err);
    });
}
// Add a message to the messages element.
function appendMessage(payload) {
    const messagesElement = document.querySelector('#messages');
    const dataHeaderELement = document.createElement('h5');
    const dataElement = document.createElement('pre');
    dataElement.style = 'overflow-x:hidden;';
    dataHeaderELement.textContent = 'Received message:';
    dataElement.textContent = JSON.stringify(payload, null, 2);
    messagesElement.appendChild(dataHeaderELement);
    messagesElement.appendChild(dataElement);
}
// Clear the messages element of all children.
function clearMessages() {
    /*
    const messagesElement = document.querySelector('#messages');
    while (messagesElement.hasChildNodes()) {
        messagesElement.removeChild(messagesElement.lastChild);
    }*/
}
function updateUIForPushEnabled(currentToken) {
    showToken(currentToken);
    $('#appNotificationEnablerBlock .col').html('Notification sucessfully activated.');
}
function updateUIForPushPermissionRequired() {
    var r = confirm("Activate comeety notifications on this browser?");
    if (r == true) {
        setPushPermissionAccepted(true);
        requestPermission();
    } else {
        setPushPermissionAccepted(false);
        console.log('permission refused');
    }
}

