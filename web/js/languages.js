var app = new Vue({
    delimiters: ['${', '}'],
    el: '#vueapp',
    data: {
        languages:[],
        userLanguages: {},
        selectedLanguage: '',
        selectedLevel: '',
        dialogId:'',
        errors:[],
        modalId: '#userLanguageModal',
        loaded:false,
    },
    mounted: function () {
        this.getLanguages()
        this.getUserLanguages()
    },
    methods: {
        getLanguages: function(){
            ApiClient2.get('/languages')
                .then(function (response) {
                    app.languages = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        getUserLanguages: function(){
            ApiClient2.get('/users/'+CURRENT_USER_ID+'/languages')
                .then(function (response) {
                    let userLanguages = {};

                    if(response.data !== '') {
                        response.data.forEach(function (element) {
                            userLanguages[element.id] = element;
                        });
                    }

                    app.userLanguages = userLanguages;
                })
                .catch(function (error) {
                    console.log(error);
                })
                .then(function() {
                    app.loaded = true;
                });

        },
        createUserLanguage: function(e){

            ApiClient2.put('/users/'+CURRENT_USER_ID+'/languages/'+this.selectedLanguage, $(e.target).serialize())
                .then(function (response) {
                    //handle success
                    app.userLanguages[response.data.id] = response.data;
                    app.resetForm();
                    app.hideUserLanguageDialog();
                })
                .catch(function (error) {
                    app.errors = [];
                    var error_message = '';
                    if (error.response) {
                        if (error.response.status == '400') {
                            if (error.response.data.hasOwnProperty('errors') && error.response.data.errors.hasOwnProperty('children')) {
                                if (error.response.data.errors.children.hasOwnProperty('language')) {
                                    error_message = error.response.data.errors.children.language.errors[Object.keys(error.response.data.errors.children.language.errors)[0]];
                                    switch(error_message) {
                                        case 'not_blank':
                                            app.errors.push('Choose a language');
                                            break;
                                        default:
                                            app.errors.push('An error occured for this language');
                                    }
                                }
                                if (error.response.data.errors.children.hasOwnProperty('level')) {
                                    app.errors.push('Choose a level');
                                }
                            } else {
                                app.errors.push('An error occured. Please try again');
                            }
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
        },
        resetForm: function(){
            this.selectedLanguage = '';
            this.selectedLevel = '';
        },
        showUserLanguageDialog: function(item) {
            this.dialogId = (item || {}).id;
            if (typeof item !== 'undefined') {
                this.selectedLanguage = (item || {}).language.id;
            }
            this.selectedLevel = (item || {}).level;
            $(this.modalId).modal('open');
        },
        hideUserLanguageDialog: function(){
            $(this.modalId).modal('close');
        },
    }
})