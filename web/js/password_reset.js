$(document).ready(function() {
    $('form#password-reset').submit(function(event) {
        event.preventDefault();

        if($('#password-reset input[name="plainPassword"]').val() === '') {
            displayRegistrationErrorMessage('Please choose a password');
            $("input[name='plainPassword']").addClass('invalid');
            return;
        }

        if($('#password-reset input[name="repeatPassword"]').val() !== $('#password-reset input[name="plainPassword"]').val()) {
            displayRegistrationErrorMessage('The two password must be identicals');
            $("input[name='plainPassword']").addClass('invalid');
            $("input[name='repeatPassword']").addClass('invalid');
            return;
        }

        ApiClient1.put(
            '/user/password',
            {
                plainPassword: $("input[name='plainPassword']").val(),
                token: getUrlVars()['token']
            },
            function(msg) {
                handlePasswordReset(msg);
            }
        );

    });

});

function getUrlVars() {
    var vars = {};
    var parts = window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function(m,key,value) {
            vars[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    return vars;
}


function handlePasswordReset(xhr)
{
    errorMsg = '';
    response = xhr.responseJSON;
    if(xhr.status !== 204) {
        if(response.message === 'token_not_present' ||
            response.message === 'token_not_valid') {
            errorMsg = 'Token is not valid';
        } else if (response.message === 'token_expired') {
            errorMsg = 'Token is not valid anymore';
        } else if (response.message === 'password_not_present' ||
            response.message === 'empty_password') {
            errorMsg = 'Please choose a password';
        } else {
            errorMsg = 'An error occured';
        }
        displayRegistrationErrorMessage(errorMsg);
    } else {
        window.location.href = PASSWORD_SUCCESSFULLY_CHANGED_URL;
    }
}

function displayRegistrationErrorMessage(message)
{
    $('#password-reset-error-message').html('');
    $('#password-reset-error-message').append(message);
    $('#password-reset-error-block').toggleClass('hide', false);
}