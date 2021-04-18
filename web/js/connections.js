$(document).ready(function() {

    $('ul.tabs').tabs({
        'onShow' : function(id) {getTabContent(id);}
    });

    function getTabContent(id) {
        var tab = id[0].id;
        switch(tab) {
            case 'following':
                loadFollowing();
                break;
            case 'followers':
                loadFollowers();
                break;
            case 'blocked':
                loadBlocked();
                break;
            default:
                console.log('unknown tab id');
        }
    }

    function loadFollowing(){
        loadingScreen('Loading contacts...');
        ApiClient1.get(
            '/user/links',
            null,
            function(msg) {
                handleReturn(msg, 'following');
            }
        );
    }

    function loadFollowers(){
        loadingScreen('Loading followers...');
        ApiClient1.get(
            '/user/followers',
            null,
            function(msg) {
                handleReturn(msg, 'followers');
            }
        );
    }

    function loadBlocked(){
        loadingScreen('Loading blocked comeeters...');
        ApiClient1.get(
            '/user/links/blocked',
            null,
            function(msg) {
                handleReturn(msg, 'blocked');
            }
        );
    }

    $('#connections-list').on('timeago:added', function(event){
        $('time.timeago').timeago();
    });

    $('#connections-list').on('click', '.delete-user-link', function(event) {
        event.preventDefault();
        var targetUserId = $(event.currentTarget).data('target-user-id');

        ApiClient1.delete(
            '/user/links/'+targetUserId,
            null,
            function(msg) {
                handleModificationReturn(msg, targetUserId, 'delete');
            }
        );
    });

    $('#connections-list').on('click', '.pause-user-link', function(event) {
        event.preventDefault();
        var targetUserId = $(event.currentTarget).data('target-user-id');

        ApiClient1.put(
            '/user/links/'+targetUserId,
            {'type': 'pause'},
            function(msg) {
                handlePauseReturn(msg, targetUserId);
            }
        );
    });

    $('#connections-list').on('click', '.block-user-link', function(event) {
        event.preventDefault();
        var targetUserId = $(event.currentTarget).data('target-user-id');

        ApiClient1.put(
            '/user/links/'+targetUserId,
            {'type': 'block'},
            function(msg) {
                handleBlockReturn(msg, targetUserId);
            }
        );
    });

    $('#connections-list').on('click', '.connect-user-link', function(event) {
        event.preventDefault();
        var targetUserId = $(event.currentTarget).data('target-user-id');

        ApiClient1.put(
            '/user/links/'+targetUserId,
            {'type': 'follow'},
            function(msg) {
                handleConnectReturn(msg, targetUserId);
            }
        );
    });

});

function handleDeleteReturn(xhr, targetUserId)
{
    if(xhr.status !== 204) {
        $('#error-modal .modal-content').html('An error occurred while trying to delete the contact');
        $('#error-modal').modal('open');
    } else {
        $('#connection-' + targetUserId).remove();
        if($('#connections-list').html() === "") {
            displayNoConnectionMessage($('#connections-list').attr('data-mode'), 'An error occured');
        }
    }
}

function loadingScreen(msg) {
    $('#connections-list').html(msg);
    $('#no-connection-message-block').addClass('hide');
}

function updateConnectionElement(connection) {
    content = getConnectionContent(connection, 'following');
    id = content.attr('id');
    $('#'+id).replaceWith(content);
    $('#'+id).trigger('timeago:added');
    $('#'+id +' .dropdown-button').dropdown();
}

function handlePauseReturn(xhr, targetUserId)
{
    if(xhr.status < 200 || xhr.status > 299) {
        $('#error-modal .modal-content').html('An error occurred while trying to pause the contact');
        $('#error-modal').modal('open');
    } else {
        connection = xhr.responseJSON;
        updateConnectionElement(connection);
    }
}

function handleConnectReturn(xhr, targetUserId)
{
    if(xhr.status < 200 || xhr.status > 299) {
        $('#error-modal .modal-content').html('An error occurred while trying to connect with the contact');
        $('#error-modal').modal('open');
    } else {
        if($('#connections-list').attr('data-mode') === 'blocked') {
            $('#connection-' + targetUserId).remove();
            if($('#connections-list').html() === "") {
                displayNoConnectionMessage($('#connections-list').attr('data-mode'), 'An error occured');
            }
        } else {
            connection = xhr.responseJSON;
            updateConnectionElement(connection);
        }
    }
}

function handleBlockReturn(xhr, targetUserId)
{
    if(xhr.status < 200 || xhr.status > 299) {
        $('#error-modal .modal-content').html('An error occurred while trying to block the contact');
        $('#error-modal').modal('open');
    } else {
        $('#connection-' + targetUserId).remove();
        if($('#connections-list').html() === "") {
            console.log($('#connections-list').attr('data-mode'));
            displayNoConnectionMessage($('#connections-list').attr('data-mode'), 'An error occured');
        }
    }
}

function displayNoConnectionMessage(mode, defaultMessage) {
    switch(mode) {
        case 'following':
            msg = 'You don\'t follow any comeeter';
            break;
        case 'followers':
            msg = 'You don\'t have any followers yet';
            break;
        case 'blocked':
            msg = 'You have 0 comeeters in your blocked list :)';
            break;
    }
    $('#connections-list').html('');
    $('#no-connection-message-block #no-connection-message-block-message').html(msg);
    $('#no-connection-message-block').removeClass('hide');
}

function handleReturn(xhr, mode)
{
    connections = xhr.responseJSON;

    $('#connections-list').html('');
    $('#connections-list').attr('data-mode', mode);

    if(xhr.status === 204) {
        var msg ='An unknown error occurred';
        displayNoConnectionMessage(mode, msg);
        return;
    }

    if(xhr.status !== 200) {
        $('#error-modal .modal-content').html('An error occured while trying to retrieve your contact list');
        $('#error-modal').modal('open');
        return;
    }

    for(var key in connections) {
        displayConnection(connections[key], mode);
    }
    $('#connections-list').trigger('timeago:added');
}

function displayConnection(connection, mode)
{
    connectionContent = getConnectionContent(connection, mode);
    $('#connections-list').append(connectionContent);
    id = connectionContent.attr('id');
    $('#'+id).trigger('timeago:added');
    $('#'+id +' .dropdown-button').dropdown();
}

function getConnectionContent(connection, mode)
{
    var connectionContent = $('#connection-template').clone().removeAttr('id').removeClass('hide');
    var userLink = connection;

    if(mode === 'followers') {
        targetUser = connection.followerLink.user;
        userLink = connection.followerLink;
    } else {
        targetUser = connection.targetUser;
    }

    connectionContent.attr('id', 'connection-'+targetUser.id);
    connectionContent.find('.name').first().append(targetUser.profile.firstName);
    connectionContent.find('.commitment-avatar').first().addClass('commitment-avatar-'+targetUser.statistics.commitmentScore);
    flagDom = connectionContent.find('.flag').first();
    flagDom.attr('src', flagDom.attr('src').replace('#native_country#', targetUser.profile.nativeCountry));

    connectionContent.find('.timeago').first().attr('datetime', userLink.creationDateTime).append(userLink.creationDateTime);
    connectionContent.html(connectionContent.html().replace(/#target_user_id#/g, targetUser.id));
    profileUrl = PROFILE_URL_PATH.replace('#user-id#', targetUser.id);
    connectionContent.find('.detail-link').first().attr('href', profileUrl);
    connectionContent.find('.dropdown-button').first().attr('data-activates', 'connection-dropdown-'+targetUser.id);

    if(mode === 'following') {
        if(userLink.type === 1) {
            connectionContent.find('.dropdown-content').first().find('.connect-user-link').first().closest('li').first().remove();
            connectionContent.find('.state').first().html('Connected').addClass('connection-connected').removeClass('hide');
        } else {
            connectionContent.find('.dropdown-content').first().find('.pause-user-link').first().closest('li').first().remove();
            connectionContent.find('.state').first().html('Paused').addClass('connection-paused').removeClass('hide');
        }
    }

    if(mode === 'followers') {
        if(connection.link !== undefined) {
            connectionContent.find('.timeago').first().attr('datetime', connection.link.creationDateTime).append(userLink.creationDateTime);
            if(userLink.type === 1) {
                connectionContent.find('.dropdown-content').first().find('.connect-user-link').first().closest('li').first().remove();
                connectionContent.find('.state').first().html('Connected').addClass('connection-connected').removeClass('hide');
            } else {
                connectionContent.find('.dropdown-content').first().find('.pause-user-link').first().closest('li').first().remove();
                connectionContent.find('.state').first().html('Paused').addClass('connection-paused').removeClass('hide');
            }
        } else {
            connectionContent.find('.dropdown-content').first().find('.connect-user-link').first().closest('li').first().remove();
            connectionContent.find('.time').first().remove();
        }
    }
    if(mode === 'blocked') {
        connectionContent.find('.dropdown-content').first().find('.pause-user-link').first().closest('li').first().remove();
        connectionContent.find('.dropdown-content').first().find('.block-user-link').first().closest('li').first().remove();
    }
    return connectionContent;
}