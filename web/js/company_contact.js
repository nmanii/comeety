$(document).ready(function() {
    $('#contact_form').submit(function(event) {
        event.preventDefault();
        ApiClient1.post(
            '/company/messages',
            $(event.currentTarget).serialize(),
            function(msg) {
                handleReturn(msg);
            }
        );

    });

    $('#send-message').click(function(event) {
        event.preventDefault();
        $('#contact_form').submit();
    });
});

function handleReturn(xhr)
{
    if(xhr.status !== 204) {
        prepareFormErrorMessage(xhr);
    } else {
        $('#form-error-block').toggleClass('hide', true);
        $('#form-success-block').toggleClass('hide', false);
        $('#contact_form').toggleClass('hide', true);
    }
}

function prepareFormErrorMessage(xhr)
{
    var msg = '';
    var errors = xhr.responseJSON.errors.children;

    for (var k in errors){
        if (errors.hasOwnProperty(k)) {
            if(errors[k].hasOwnProperty('errors')) {
                if('senderName' == k) {
                    msg += '<li>Name can not be empty</li>';
                    $("input[name='senderName']").addClass('invalid');
                    $("label[for='senderName']").attr('data-error', 'Name').addClass('error');
                }
                if('senderEmail' == k) {
                    msg += '<li>Email can not be empty</li>';
                    $("input[name='senderEmail']").addClass('invalid');
                    $("label[for='senderEmail']").attr('data-error', 'Email can not be empty').addClass('error');;
                }
                if('subject' == k) {
                    msg += '<li>Subject can not be empty</li>';
                    $("input[name='subject']").addClass('invalid');
                    $("label[for='subject']").attr('data-error', 'Subject can not be empty').addClass('error');;
                }
                if('content' == k) {
                    msg += '<li>Content can not be empty</li>';
                    $("input[name='content']").addClass('invalid');
                    $("label[for='content']").attr('data-error', 'Content can not be empty').addClass('error');;
                }

            }
        }
    }
    if(msg != '') {
        msg = 'Some errors occured: <ul>'+msg+'</ul>'
    }
    displayFormErrorMessage(msg);
}

function displayFormErrorMessage(msg)
{
    $('#form-error-block').find('.card-panel').first().html(msg);
    $('#form-error-block').toggleClass('hide', false);
}