$(document).ready(function() {
    $('.register-trigger').click(function(event) {
        event.preventDefault();
        $('#login-block').hide();
        $('#password-reset-block').hide();
        $('#register-block').show();
    });
    $('.login-trigger').click(function(event) {
        event.preventDefault();
        $('#login-block').show();
        $('#password-reset-block').hide();
        $('#register-block').hide();
    });
    $('.password-reset-trigger').click(function(event) {
        event.preventDefault();
        $('#login-block').hide();
        $('#password-reset-block').show();
        $('#register-block').hide();
    });


    $('#login-block form, .login-block form').submit(function(event) {
        event.preventDefault();
        $('.login-error-block').toggleClass('hide', true);

        if(typeof IS_DISCOURSE_AUTHENTICATION !== "undefined" && IS_DISCOURSE_AUTHENTICATION === true) {
            discourseFunnel = true;
        } else {
            discourseFunnel = false;
        }

        ApiClient1.post(
            '/token-cookie',
            $(event.currentTarget).serialize(),
            function (msg) {
                handleLogin(msg, discourseFunnel);
            }
        );

    });

    $('#password-reset-block form').submit(function(event) {
        event.preventDefault();
        $('.login-error-block').toggleClass('hide', true);
        ApiClient1.put(
            '/password-reset-request',
            $(event.currentTarget).serialize(),
            function(msg) {
                handlePasswordResetRequest(msg);
            }
        );

    });

    $(".register-block form").submit(function(event) {
        event.preventDefault();

        $('.register-error-block').toggleClass('hide', true);

        if($(event.currentTarget).find('input[name="repeatPassword"]').val() !== $(event.currentTarget).find('input[name="plainPassword"]').val()) {
            displayRegistrationErrorMessage('Passwords don\'t match');
            $("input[name='plainPassword']").addClass('invalid');
            $("input[name='repeatPassword']").addClass('invalid');
            return;
        }

        ApiClient1.post(
            '/users',
            $(event.currentTarget).find("input[name='email'], input[name='plainPassword'], input[name='inviteId'], input[name='inviteToken']").serialize(),
            handleRegistrationMain(event)
        );

    });
});

function tryAutoLogin()
{
    //If user is already loggued
    if(currentUserId != null) {
        if(typeof IS_DISCOURSE_AUTHENTICATION !== "undefined" && IS_DISCOURSE_AUTHENTICATION === true) {
            discourseLogin();
        } else {
            window.location.href = LOGIN_SUCCESS_URL_PATH;
        }
    }
}

function discourseLogin()
{
    data = [];
    data.push({name: "discoursePayload", value: DISCOURSE_NONCE});

    ApiClient1.post(
        '/discourse-token',
        $.param(data),
        function (msg) {
            console.log('handle discourse login');
            handleDiscourseLogin(msg);
        }
    );
}

function handleDiscourseLogin(xhr)
{
    data = xhr.responseJSON;
    if(!data.hasOwnProperty('sig')) {
        window.location.href = LOGIN_SUCCESS_URL_PATH;
    } else {
        window.location.href = DISCOURSE_SUCCESS_URL_PATH+'?sso='+data.payload+'&sig='+data.sig;
    }

}

function handleRegistrationMain(event)
{
    return function(data, textStatus, jqXHR) {
        handleRegistration(data, event);
    };
}

function handleLogin(xhr, discourseFunnel)
{
    if(xhr.status !== 200) {
        prepareLoginErrorMessage(xhr.status);
        $('.login-error-block').toggleClass('hide', false);
    } else {
        $('.login-error-block').toggleClass('hide', true);
        //force retrieve from server
        if(discourseFunnel) {
            discourseLogin();
        } else {
            window.location.href = LOGIN_SUCCESS_URL_PATH;
        }
    }
}

function prepareLoginErrorMessage(requestStatus)
{
    var msg = '';
    switch (requestStatus) {
        case 404: msg = "No account found with this email";break;
        case 401: msg = "Incorrect email or password.";break;
        case 403: msg = "The account has not been confirmed. <br /><br />An email with the subject 'Please confirm your email' has been sent when you created your account. Please click on the link inside to activate your account. <br /><br />Didn't receive the email yet? Send us an email on team@comeety.net";break;
        default: msg = "An unexpected error has occured. Please try later.";
    }

    $('.login-error-message').html(msg);
}

function handlePasswordResetRequest(xhr)
{
    if(xhr.status !== 204) {
        preparePasswordResetRequestErrorMessage(xhr.status);
        $('.password-reset-error-block').toggleClass('hide', false);
    } else {
        $('#password-reset-form-block').toggleClass('hide', true);
        $('.password-reset-error-block').toggleClass('hide', true);
        $('.password-reset-success-block').toggleClass('hide', false);
    }
}

function preparePasswordResetRequestErrorMessage(requestStatus)
{
    var msg = '';
    switch (requestStatus) {
        case 404: msg = "No user found for this email.";break;
        case 422: msg = "Please enter your email.";break;
        default: msg = "An unexpected error has occured. Please try later.";
    }

    $('.password-reset-error-message').html(msg);
}

function handleRegistration(xhr, event)
{
    if(xhr.status !== 201) {
        prepareRegistrationErrorMessage(xhr);
    } else {
        $('.register-error-block').toggleClass('hide', true);
        if(true === xhr.responseJSON.confirmed) {
            //if email is preconfirmed, we continue to registration next step
            ApiClient1.post(
                '/token-cookie',
                {
                    'password': $(event.currentTarget).find("input[name='plainPassword']").val(),
                    'username': $(event.currentTarget).find("input[name='email']").val()
                },
                function(msg) {
                    window.location.href = LOGIN_SUCCESS_URL_PATH;
                }
            );
        } else {
            window.location.href = REGISTRATION_SUCCESS_URL_PATH;
        }
    }
}

function prepareRegistrationErrorMessage(xhr)
{
    var msg = '';
    switch (xhr.status) {
        case 409: msg = "Email already used.";break;
        default: msg = "";
    }

    if(xhr.responseJSON.hasOwnProperty(errors) && xhr.responseJSON.errors.hasOwnProperty(children)) {
        var errors = xhr.responseJSON.errors.children;

        for (var k in errors) {
            if (errors.hasOwnProperty(k)) {
                if (errors[k].hasOwnProperty('errors')) {
                    if ('email' == k) {
                        msg += '<li>Email can not be empty</li>';
                        $("input[name='email']").addClass('invalid');
                        $("label[for='email']").attr('data-error', 'Email can not be empty').addClass('error');
                    }
                    if ('plainPassword' == k) {
                        msg += '<li>Password can not be empty</li>';
                        $("input[name='plainPassword']").addClass('invalid');
                        $("label[for='plainPassword']").attr('data-error', 'Password can not be empty').addClass('error');
                        ;
                    }

                }
            }
        }
    }

    if(msg != '') {
        msg = 'Some errors occured: <ul>'+msg+'</ul>'
    } else {
        msg = 'Some errors occured.'
    }

    displayRegistrationErrorMessage(msg);
}

function displayRegistrationErrorMessage(msg)
{
    $('.register-error-message').html(msg);
    $('.register-error-block').first().toggleClass('hide', false);
}