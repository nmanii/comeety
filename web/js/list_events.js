$(document).ready(function() {
    change();

    window.onhashchange = function(){
        change();
    }
});

function change() {
    var periodToDisplay = "future";
    if(window.location.hash) {
        var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
        if(hash === "past") {
            periodToDisplay = hash;
        }
    }

    displayEvents(periodToDisplay);
}

function displayEvents(periodToDisplay) {
    window && window.scroll(0,0);
    $('#event-list-block').html('<span >Loading events ...</span><div class="loader"></div>');
    if(periodToDisplay === "past"){
        ApiClient1.get(
            '/events/past',
            null,
            function(xhr) {
                showEvents(xhr, periodToDisplay);
            }
        );
    } else {
        ApiClient1.get(
            '/events',
            null,
            function(xhr) {
                showEvents(xhr, periodToDisplay);
            }
        );
    }
}

function showEvents(xhr, periodToDisplay)
{
    var events = xhr.responseJSON;
    var previousDate = null;
    var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var month = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
    div = document.createDocumentFragment();

    var eventTemplate = document.querySelector('#event-template').innerHTML;
    Mustache.parse(eventTemplate);
    var eventsDOM = [];

    if(xhr.status === 204 && periodToDisplay !== "past") {
        eventListBlock = document.querySelector('#event-list-block');
        emptyEventListTemplateClone = document.querySelector('#events-empty-template').cloneNode(true);
        emptyEventListTemplateClone.setAttribute('id', '');
        emptyEventListTemplateClone.classList.remove('hide');
        var cNode = eventListBlock.cloneNode(false);
        eventListBlock.parentNode.replaceChild(cNode ,eventListBlock);
        cNode.appendChild(emptyEventListTemplateClone);
        return;
    }

    for (i = 0; i < events.length; i++) {
        eventInfo = events[i];
        var date = moment(eventInfo.startDateTime).toDate();


        if(previousDate === null || previousDate !== date.getUTCDate()) {
            if(previousDate !== null) {
                div.querySelector('#' + eventsBlockId).innerHTML = eventsDOM.join('');
            }

            eventsBlockId = 'events'+date.getUTCDate()+'-'+date.getUTCMonth()+'-'+date.getUTCFullYear();
            previousDate = date.getUTCDate();
            dateContentDOM = document.querySelector('#date-template').querySelector('.date-block').cloneNode(true);
            dateContentDOM.querySelector('.date').innerHTML += weekday[date.getUTCDay()]+ ', '+month[date.getUTCMonth()]+' '+date.getUTCDate();
            if(periodToDisplay === "past") {
                dateContentDOM.innerHTML+= '<time class="timeago past-event-date" datetime="'+eventInfo.startDateTimeUTC+'">'+eventInfo.startDateTimeUTC+'</time>';
            }

            eventsContentDOM = document.querySelector('#events-template').querySelector('.row').cloneNode(true);
            eventsContentDOM.setAttribute('id', eventsBlockId);

            div.appendChild(dateContentDOM);
            div.appendChild(eventsContentDOM);
            eventsDOM = [];
        }

        data = {
            'title': eventInfo.title,
            'detail-link': '/events/'+eventInfo.id,
            'organiserName': eventInfo.user.profile.firstName,
            'count': eventInfo.maximumCapacity,
            'address': eventInfo.address,
            'time': date.getUTCHours()+':'+('0'+date.getUTCMinutes()).slice(-2),
            'alternateClass': '',
            'placeName': '',
            'address': eventInfo.address,
            'categoryIcon': '',
            'commitmentScore':eventInfo.user.statistics.commitmentScore,
            'nativeCountry': eventInfo.user.profile.nativeCountry,
        };

        if(i%2 === 0) {
            data.alternateClass = 'alternate';
        }
        if(eventInfo.placeName !== null) { data.placeName = eventInfo.placeName+'<br />' }
        if(eventInfo.eventCategory != null) {
            data.categoryIcon = '<i class="fa ' + eventInfo.eventCategory.iconClass + '"></i>';
        }
        var rendered = Mustache.render(eventTemplate, data);
        eventsDOM.push(rendered);
    }
    div.querySelector('#' + eventsBlockId).innerHTML = eventsDOM.join('');
    eventListBlock = document.querySelector('#event-list-block');

    var cNode = eventListBlock.cloneNode(false);
    eventListBlock.parentNode.replaceChild(cNode ,eventListBlock);

    cNode.appendChild(div);
    $('time.timeago').timeago();
}