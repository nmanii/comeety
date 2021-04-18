$(document).ready(function() {

    $('#event_invitation-modal-trigger').on('click', function(event) {
        event.preventDefault();
        eventId = $(event.currentTarget).data('event-id');
        var eventInvitationModal = $($(event.currentTarget).attr('href'));
        eventInvitationModal.modal({dismissible: true, opacity: .5});
        $('#event_invite-list').html('');
        $('#event-invite-success').toggleClass('hide', true);
        $('#event-invite-empty-list').toggleClass('hide', true);
        ApiClient1.get(
            '/user/links',
            null,
            function(msg) {
                handleConnectionReturn(msg);
                handleAlreadyInvitedUser(function() {openModal(eventInvitationModal);});

            }
        );

        $('#event-invite-main').toggleClass('hide', false);

    });

    $('#event-invite-submit').on('click', function(event) {
        $('#event_invite_module form').submit();
    })

    $('#event_invite_module form').submit(function(event){
        event.preventDefault();
        var eventId = $(event.currentTarget).data('event-id');
        usersList = getSelectedUserForInvite();
        if(usersList.length > 0) {
            ApiClient1.post(
                '/events/' + eventId + '/user/invitations',
                {invitedUsers: usersList},
                function (xhr) {
                    handleEventInvitationPost(xhr, $(event.currentTarget));
                }
            );
        } else {
            alert('Please select comeeters you would like to invite');
        }
    });

});

function openModal(modal) {
    modal.modal('open');
}

function getSelectedUserForInvite() {
    var usersList = [];
    $('#event_invite_module form input[type="checkbox"]:checked').filter(function() {
        return !this.disabled && this.checked;
    }).each(function() {
        usersList.push({'invitedUser': $(this).val()});
    });
    return usersList;
}

function handleAlreadyInvitedUser(callback) {
    ApiClient1.get(
        '/events/'+eventId+'/user/invitations',
        null,
        function(xhr) {
            handleEventInvitationReturn(xhr);
            callback();
        }
    );

}

//Display connections for invite

function handleConnectionReturn(xhr)
{
    connections = xhr.responseJSON;

    $('#connections-list').html('');

    if(xhr.status === 204) {
        $('#event-invite-success').toggleClass('hide', true);
        $('#event-invite-main').toggleClass('hide', true);
        $('#event-invite-empty-list').toggleClass('hide', false);

        return;
    }

    if(xhr.status !== 200) {
        $('#error-modal .modal-content').html('An error occured while trying to retrieve your contact list');
        $('#error-modal').modal('open');
        return;
    }

    for(var key in connections) {
        displayConnection(connections[key]);
    }

    $('#connections-list').trigger('timeago:added');
}

function displayConnection(connection)
{
    connectionContent = getConnectionContent(connection);
    $('#event_invite-list').html();
    $('#event_invite-list').append(connectionContent);
    id = connectionContent.attr('id');
    $('#'+id).trigger('timeago:added');
}

function getConnectionContent(connection)
{
    var connectionContent = $('#event_invite-list-user-template').clone().removeAttr('id').removeClass('hide');
    var userLink = connection;

    targetUser = connection.targetUser;

    connectionContent.attr('id', 'connection-'+targetUser.id);
    connectionContent.find('.user-label').first().append([targetUser.profile.firstName, targetUser.profile.lastName].join(' '));

    connectionContent.html(connectionContent.html().replace(/#target_user_id#/g, targetUser.id));

    return connectionContent;
}

//Invitation
function handleEventInvitationReturn(xhr)
{
    if(xhr.status == 200) {
        invitations = xhr.responseJSON;
        for(var key in invitations) {
            invitedUser = invitations[key].invitedUser;
            var userRow = $('#event-invite-user-'+invitedUser.id).addClass('filled-in').attr('checked', "checked").attr('disabled', 'disabled');
        }
    }
}

function handleEventInvitationPost(xhr, target)
{
    if(xhr.status == 200) {
        $('#event-invite-success').toggleClass('hide', false);
        $('#event-invite-main').toggleClass('hide', true);
        $('#event-invite-empty-list').toggleClass('hide', true);
    }
}