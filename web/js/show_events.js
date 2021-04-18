
$(document).ready(function() {
    $('.join-event-trigger').click(function(event){
        event.preventDefault();
        var eventId = $(event.currentTarget).data('event-id');
        ApiClient1.put(
            '/events/'+eventId+'/user',
            {'state': 'confirmed'},
            function(xhr) {
                handleRegistrationToEvent(xhr, eventId);
            }
        );
    });

    $('.cancel-registration-trigger').click(function(event){
        event.preventDefault();
        var eventId = $(event.currentTarget).data('event-id');
        ApiClient1.put(
            '/events/'+eventId+'/user',
            {'state': 'cancelled'},
            function(xhr) {
                handleRegistrationCancellationToEvent(xhr, eventId);
            }
        );
    });

    $('.btn_connect').click(function(event){
        event.preventDefault();
        var targetId = $(event.currentTarget).data('target-id');
        var eventId = $(event.currentTarget).data('event-id');

        ApiClient1.put(
            '/user/links/'+targetId,
            {'type': 'follow', 'event': eventId},
            function(xhr) {
                response = xhr.responseJSON;
                if(xhr.status == 422) {
                    if (response.message == 'both_users_not_registered_to_event') {
                        alert('You must be registered to the event to connect with this user.');
                    } else if (response.message == 'event_not_started') {
                        alert('You will be able to connect once the event has started.');
                    } else if (response.message == 'event_not_exists') {
                        alert('Could not retrieve informations about the event.');
                    }
                } else if(xhr.status === 200 || xhr.status === 201) {
                    $(event.currentTarget).replaceWith('<i class="small fa fa-user-circle-o" aria-hidden="true"></i>');
                }
            }
        );
    });

    $('#messages').on('timeago:added', function(event){
        $('time.timeago').timeago();
    });
    $('#feedbacks').on('timeago:added', function(event){
        $('time.timeago').timeago();
    });

    $('#form_message').submit(function(event){
        event.preventDefault();
        ApiClient1.post(
            '/events/'+EVENT_ID+'/user/messages',
            $(event.currentTarget).serialize(),
            function(xhr) {
                handleMessagePost(xhr);
            }
        );
    });


    ApiClient1.get(
        '/events/' + EVENT_ID + '/messages',
        null,
        function (xhr) {
            displayMessages(xhr);
        }
    );


    if(LOAD_FEEDBACKS) {
        ApiClient1.get(
            '/events/' + EVENT_ID + '/feedback',
            null,
            function (xhr) {
                displayFeedbacks(xhr);
            }
        );
    }

    $('#share_mobile').click(function(event){
        navigator.share({
            title: document.querySelector("meta[name='twitter:title']").getAttribute("content"),
            text: document.querySelector("meta[name='twitter:description']").getAttribute("content"),
            url: document.location.href,
        })
            .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    });


    if (navigator.share) {
        $('#share_mobile').removeClass('hide');
    }


});

function handleRegistrationToEvent(xhr, eventId)
{
    if(xhr.status !== 201 && xhr.status !== 200) {
        response = xhr.responseJSON;
        if(xhr.status == 403 && response.message == "registration_limit_to_public_event_reached") {
            $('#registration-to-public-event-limit-reached-modal').modal('open');
        } else if(xhr.status == 422 && response.message == "user_commitment_score_zero") {
            $('#user-commitment-score-zero-reached-modal').modal('open');
        } else {
            alert('An error occurred. Please try again.');
        }

    } else {
        eventUser = xhr.responseJSON;
        redirectUrl = CREATE_EVENT_SUCCESS_URL_PATH.replace('{eventId}', eventId);
        window.location.href = redirectUrl;
    }
}

function handleRegistrationCancellationToEvent(xhr, eventId)
{
    if(xhr.status !== 200) {
        alert('An error occurred. Please try again.');
    } else {
        eventUser = xhr.responseJSON;
        redirectUrl = CREATE_EVENT_SUCCESS_URL_PATH.replace('{eventId}', eventId);
        window.location.href = redirectUrl;
    }
}

function displayFeedbacks(xhr)
{
    if (xhr.status != 200 && xhr.status != 204) {
        alert('An error occurred while trying to get the feedbacks.');
    } else {
        feedbacks = xhr.responseJSON;
        $('#loader-feedbacks').html('');
        var showFeedbackRequest = true;
        if(feedbacks.length === 0) {
            $('#no-feedback-message').removeClass('hide');
        } else {
            for (var key in feedbacks) {
                displayFeedback(feedbacks[key]);
                if(feedbacks[key].user.id === currentUserId) {
                    showFeedbackRequest = false;
                }
            }
        }

        if(showFeedbackRequest && IS_CURRENT_USER_REGISTERED_TO_EVENT) {
            $('#feedback-request').removeClass('hide');
        }
    }
}

function displayFeedback(message)
{
    feedbackContent = $('#feedback-template').clone().removeAttr('id').removeClass('hide');
    feedbackContent.find('.name').first().append(message.user.profile.firstName);
    if(message.comment != null ) {
        feedbackContent.find('.content').first().append(message.comment.nl2br());
    }
    feedbackContent.find('.timeago').first().attr('datetime', message.creationDateTime).append(message.creationDateTime);
    feedbackContent.find('.rating').first().append(getSmileyFromRating(message.rating));
    $('#feedbacks').prepend(feedbackContent);
    $('#feedbacks').trigger('timeago:added');
}

function getSmileyFromRating(rating)
{
    var smiley;
    switch (rating) {
        case 'bad':
             smiley = '<i class="fa fa-frown-o fa-2x" aria-hidden="true"></i>';
             break;
        case 'normal':
            smiley = '<i class="fa fa-meh-o fa-2x" aria-hidden="true"></i>';
            break;
        case 'good':
            smiley = '<i class="fa fa-smile-o fa-2x" aria-hidden="true"></i>';
            break;
    }
    return smiley;
}

function displayMessages(xhr)
{
    if (xhr.status != 200 && xhr.status != 204) {
        msg = "an error occured.";
        $('#message-error').html(msg).toggleClass('hide', false);
    } else {
        messages = xhr.responseJSON;
        if(!IS_CURRENT_USER_AUTHENTICATED) {
            if (typeof messages == "undefined") {
                $('#comments-block').hide();
            }
        }
        for(var key in messages) {
            displayMessage(messages[key]);
        }
        $('#message-error').toggleClass('hide', true);
    }
}

function displayMessage(message)
{
    messageContent = $('#message-template').clone().removeAttr('id').removeClass('hide');
    messageContent.find('.name').first().append(message.user.profile.firstName);
    messageContent.find('.name').first().attr("href", USER_PROFILE_URL_PATH.replace('{userId}', message.user.id));
    messageContent.find('.content').first().append(message.content.nl2br());
    messageContent.find('.timeago').first().attr('datetime', message.creationDateTime).append(message.creationDateTime);
    if(message.private == true) {
        messageContent.find('.private_message').first().append('<span class="private-comment-tag"><i class="fa fa-eye-slash" aria-hidden="true"></i> private</span>');
        messageContent.addClass('private-comment');
    }
    messageContent.find('.commitment-avatar').first().addClass('commitment-avatar-'+message.user.statistics.commitmentScore);
    flagDom = messageContent.find('.flag').first();
    flagDom.attr('src', flagDom.attr('src').replace('#native_country#', message.user.profile.nativeCountry));
    $('#messages').append(messageContent);
    $('#messages').trigger('timeago:added');
}

function handleMessagePost(xhr)
{
    if(xhr.status != 204 && xhr.status != 201) {
        msg = 'an error occured';
        $('#message-error').toggleClass('hide', false);

    } else {
        displayMessage(xhr.responseJSON);
        $('#message-error').toggleClass('hide', true);
        $('#form_message textarea').val('');
        $('#form_message textarea').trigger('autoresize');
        $('#form_message').reset();
    }
}