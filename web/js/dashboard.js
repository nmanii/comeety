$(document).ready(function() {

    $('ul.tabs').tabs({
        'onShow' : function(id) {getTabContent(id);}
    });

    function getTabContent(id) {
        var tab = id[0].id;
        switch(tab) {
            case 'upcoming':
                loadUpcoming();
                break;
            case 'past':
                loadPast();
                break;
            case 'pendingInvitation':
                loadPendingInvitation();
            default:
                console.log('unknown tab id');
        }
    }

    $('#events-list').on('timeago:added', function(event){
        $('time.timeago').timeago();
    });

    $('#events-list').on('click', 'li', function(event) {
        event.preventDefault();
        var href = $(event.currentTarget).data('href');

        window.location.href = href;
    });
});

function loadUpcoming() {
    $('#events-list').html('<span>Loading upcoming events...</span><div class="loader"></div>');
    ApiClient1.get(
        '/user/registered_events/upcoming',
        null,
        function (xhr) {
            showUpcomingRegisteredEvents(xhr, 'You have not registered to any upcoming events yet');
        }
    );
}

function loadPendingInvitation() {
    $('#events-list').html('<span>Loading pending invitations...</span><div class="loader"></div>');
    ApiClient1.get(
        '/user/pending_invitations_events',
        null,
        function (xhr) {
            showUpcomingRegisteredEvents(xhr, 'You don\'t have any pending invitations to events');
        }
    );
}

function loadPast(){
    $('#events-list').html('<span>Loading past events...</span><div class="loader"></div>');
    ApiClient1.get(
        '/user/registered_events/finished',
        null,
        function (xhr) {
            showPastRegisteredEvents(xhr);
        }
    );
}

function showPastRegisteredEvents(xhr)
{
    events = xhr.responseJSON;
    pastEventContent = null;
    $('#events-list').html('');
    var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var month = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');

    if(xhr.status === 204 || events.length === 0) {
        $('#events-list').append('You didn\'t attend to any event yet');
        return;
    }

    var ul = document.createElement("ul");
    $(ul).addClass('collection');
    $(ul).addClass('events-list-collection');
    var list = $(ul);
    for (i = 0; i < events.length; i++) {
        eventInfo = events[i];
        var date = moment(eventInfo.startDateTime).toDate();
        pastEventContent = $('#past-event-template').contents().clone();
        $(pastEventContent).find('.title').first().append(eventInfo.title);
        $(pastEventContent).find('.date').first().append(weekday[date.getUTCDay()]+ ', '+month[date.getUTCMonth()]+' '+date.getUTCDate());
        $(pastEventContent).find('.time').first().append(date.getUTCHours()+':'+('0'+date.getUTCMinutes()).slice(-2));
        $(pastEventContent).attr('data-href', '/events/'+eventInfo.id);
        $(pastEventContent).find('.timeago').first().attr('datetime', eventInfo.startDateTimeUTC).append(eventInfo.startDateTimeUTC);
        list.append(pastEventContent);
    }
    $('#events-list').append(list);
    $('#events-list').trigger('timeago:added');
}

function showUpcomingRegisteredEvents(xhr, emptyMessage)
{
    events = xhr.responseJSON;
    eventContent = null;
    $('#events-list').html('');
    var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var month = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
    $('#events-list').html('');
    if(xhr.status === 204 || events.length === 0) {
        $('#events-list').append(emptyMessage);
        $('#events-list').append($('#not-registered-to-events-template').contents().clone().removeClass('hide'));
        return;
    }

    var ul = document.createElement("ul");
    $(ul).addClass('collection');
    $(ul).addClass('events-list-collection');
    var list = $(ul);
    for (i = 0; i < events.length; i++) {
        eventInfo = events[i];
        var date = moment(eventInfo.startDateTime).toDate();
        eventContent = $('#upcoming-event-template').contents().clone();
        $(eventContent).find('.title').first().append(eventInfo.title);
        $(eventContent).find('.date').first().append(weekday[date.getUTCDay()]+ ', '+month[date.getUTCMonth()]+' '+date.getUTCDate());
        $(eventContent).find('.time').first().append(date.getUTCHours()+':'+('0'+date.getUTCMinutes()).slice(-2));
        $(eventContent).find('.detail-link').attr('href', '/events/'+eventInfo.id);
        $(eventContent).attr('data-href', '/events/'+eventInfo.id);
        $(eventContent).find('.timeago').first().attr('datetime', eventInfo.startDateTimeUTC).append(eventInfo.startDateTimeUTC);
        if(i%2 === 0) {
            eventContent.addClass('alternate');
        }

        list.append(eventContent);
    }
    $('#events-list').append(list);
    $('#events-list').trigger('timeago:added');
}