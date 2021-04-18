
$(document).ready(function() {
    $('#community_invite_module').modal({
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            $('.community-invite-focus').first().focus();
        }
    });
    $('#community_invite_module form').submit(function(event){
        event.preventDefault();
        ApiClient1.post(
            '/community_invitation',
            $(event.currentTarget).serialize(),
            function(xhr) {
                handleCommunityInvitationPost(xhr, $(event.currentTarget));
            }
        );
    });
});

function handleCommunityInvitationPost(xhr, target)
{
    if(xhr.status != 204 && xhr.status != 201) {
        prepareFormErrorMessage(xhr);

    } else {
        $('#community_invite-error-block').toggleClass('hide', true);
        $('#community_invite-success-block').find('#iname').html(xhr.responseJSON.firstName);
        $('#community_invite-success-block').find('#iemail').html(xhr.responseJSON.email);
        $('#community_invite-success-block').toggleClass('hide', false);
        //$('#form_message textarea').val('');
        //$('#form_message textarea').trigger('autoresize');
        target[0].reset();
    }
}

function prepareFormErrorMessage(xhr)
{
    var msg = '';

    if(xhr.responseJSON.hasOwnProperty('errors') && xhr.responseJSON.errors.hasOwnProperty('children')) {
        var errors = xhr.responseJSON.errors.children;

        for (var k in errors) {
            if (errors.hasOwnProperty(k) && errors[k].hasOwnProperty('errors')) {
                if ('email' == k) {
                    for (var kError in errors[k].errors) {
                        if (errors[k].errors.hasOwnProperty(kError)) {
                            errorKey = errors[k].errors[kError];
                            if ('not_blank' === errorKey) {
                                errorMessage = 'Email cannot be empty';
                                msg += '<li>' + errorMessage + '</li>';
                                $("input[name='email']").addClass('invalid');
                                $("label[for='email']").attr('data-error', errorMessage).addClass('error');
                            } else if('not_valid_email' === errorKey) {
                                errorMessage = 'Please enter a valid email';
                                msg += '<li>' + errorMessage + '</li>';
                                $("input[name='email']").addClass('invalid');
                                $("label[for='email']").attr('data-error', errorMessage).addClass('error');
                            }
                        }
                    }
                } else if ('firstName' == k) {
                    for (var kError in errors[k].errors) {
                        if (errors[k].errors.hasOwnProperty(kError)) {
                            errorKey = errors[k].errors[kError];
                            if ('not_blank' === errorKey) {
                                errorMessage = 'First name cannot be empty';
                                msg += '<li>' + errorMessage + '</li>';
                                $("input[name='firstName']").addClass('invalid');
                                $("label[for='firstName']").attr('data-error', errorMessage).addClass('error');
                            }
                        }
                    }
                }
            }
        }
    } else if(xhr.responseJSON.code != 204) {
        if(xhr.responseJSON.message =='community_invitation_already_sent') {
            msg = "You have already sent an invitation to this person.";
        }
    }

    if (msg == '') {
        msg = 'An unidentified error occured.';
    }
    if(msg != '') {
        msg = 'Some errors occured: <ul>'+msg+'</ul>'
    }
    displayFormErrorMessage(msg);
}

function displayFormErrorMessage(msg)
{
    $('#community_invite-error-block').find('.card-panel.error').html(msg);
    $('#community_invite-error-block').toggleClass('hide', false);
    $('#community_invite-success-block').toggleClass('hide', true);
    window.location = '#community_invite-error-message';
}