$(document).ready(function() {
        ApiClient1.get(
            '/users/'+PROFILE_USER_ID,
            null,
            function(msg) {
                handleReturn(msg);
            }
        );

        ApiClient1.get(
            '/users/' + PROFILE_USER_ID + '/statistics',
            null,
            function (msg) {
                handleStatisticsReturn(msg);
            }
        );

        if(currentUserId !== '' && PROFILE_USER_ID !== currentUserId) {
            ApiClient1.get(
                '/user/events/registered/' + PROFILE_USER_ID,
                null,
                function (msg) {
                    handleEncountersReturn(msg);
                }
            );
        }

        $('#creationDate').on('timeago:added', function(event){
            $('time.timeago').timeago();
        });

});

function handleReturn(xhr)
{
    user = xhr.responseJSON;
    $('#name').append(user.profile.firstName);
    if(user.profile.lastName != null) {
        $('#name').append(' '+user.profile.lastName)
    }
    if(user.profile.gender != null) {
        if(user.profile.gender == 1 || user.profile.gender == 2) {
            $('#gender_'+user.profile.gender).removeClass('hide');
        }
    }
    if(user.profile.nativeCountry != null) {
        $('#nativeCountry').append(isoCountries[user.profile.nativeCountry].name);
    }
    $('#creationDate time.timeago').attr('datetime', user.creationDateTime).append(user.creationDateTime);
    $('#creationDate').trigger('timeago:added');

    if(user.profile.motto != null) {
        $('#motto-text').append(user.profile.motto);
        $('.motto').removeClass('hide');
    }

    flagDom = $('.flag').first();
    flagDom.attr('src', flagDom.attr('src').replace('#native_country#', user.profile.nativeCountry));

    if(user.profile.discordName === null || user.profile.discordName === '') {
        $('#discordName').html('Not on discord');
    } else {
        $('#discordName').html(user.profile.discordName);
    }
}

function handleStatisticsReturn(xhr)
{
    userStatistics = xhr.responseJSON;

    $('#eventsRealizedCount').find('.profile-event-stat').first().append(userStatistics.eventOrganisationCount);
    $('#eventsRealizedCount').removeClass('hide');
    $('#eventsParticipatedCount').find('.profile-event-stat').first().append(userStatistics.participationCount);
    $('#eventsParticipatedCount').removeClass('hide');

    $('.commitment-avatar').first().addClass('commitment-avatar-'+userStatistics.commitmentScore);
}

function handleEncountersReturn(xhr)
{
    events = xhr.responseJSON;
    pastEventContent = null;
    $('#events-list').html('');
    var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var month = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');

    if(xhr.status === 204 || events.length === 0) {
        $('#encounters-events-list').append('Not met yet');
        return;
    }
    $('#encountersCount').append('Met '+events.length+' times');
    var div = document.createElement("div");
    var list = $(div);
    for (i = 0; i < events.length; i++) {
        eventInfo = events[i];
        var date = moment(eventInfo.startDateTime).toDate();
        pastEventContent = $('#encounters-events-template').contents().clone();
        $(pastEventContent).find('.title').first().append(eventInfo.title);
        $(pastEventContent).find('.date').first().append(weekday[date.getUTCDay()]+ ', '+month[date.getUTCMonth()]+' '+date.getUTCDate());
        $(pastEventContent).find('.time').first().append(date.getUTCHours()+':'+('0'+date.getUTCMinutes()).slice(-2));
        $(pastEventContent).find('.detail-link').attr('href', '/events/'+eventInfo.id);
        $(pastEventContent).find('.timeago').first().attr('datetime', eventInfo.startDateTimeUTC).append(eventInfo.startDateTimeUTC);
        list.append(pastEventContent);
    }
    $('#encounters-events-list').append(list);
    $('time.timeago').timeago();
}


var app = new Vue({
    delimiters: ['${', '}'],
    el: '#vueapp',
    data: {
        languages:[],
        userLanguages:[],
        loading:true,
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
            ApiClient2.get('/users/'+PROFILE_USER_ID+'/languages')
                .then(function (response) {
                    let userLanguages = {};

                    response.data.forEach(function(element){
                        userLanguages[element.id] = element;
                    });

                    app.userLanguages = userLanguages;
                })
                .catch(function (error) {
                    console.log(error);
                })
                .then(function () {
                    app.loading = false;
                });

        }
    }
})