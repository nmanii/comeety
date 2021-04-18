var app = new Vue({
    delimiters: ['${', '}'],
    el: '#vueapp',
    data: {
        discordName: '',
        errors:[],
        loaded: false,
        changeSuccessful: false,
    },
    mounted: function () {
        this.getUserDiscordName()
    },
    methods: {
        getUserDiscordName: function(){
            ApiClient2.get('/users/'+CURRENT_USER_ID)
                .then(function (response) {
                    app.discordName = response.data.profile.discordName;
                })
                .catch(function (error) {
                    console.log(error);
                })
                .then(function() {
                    app.loaded = true;
                });

        },
        updateDiscordName: function(e){
            ApiClient2.patch('/users/'+CURRENT_USER_ID+'/profile/discordname', $(e.target).serialize())
                .then(function (response) {
                    //handle success
                    app.discordName = response.data.discordName;
                    app.changeSuccessful = true;

                })
                .catch(function (error) {
                    app.errors = [];
                    var error_message = '';
                    if (error.response) {
                        if (error.response.status == '400') {
                            app.errors.push('An error occured. Please try again');
                        }
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        console.log(error.request);
                        app.errors.push('An error occured. Please check your network.');
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.log('Error', error.message);
                        app.errors.push('An error occured. Please try again.');
                    }
                });
        }
    }
})