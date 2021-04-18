$(document).ready(function() {
    submitOriginalContent = $('button[type="submit"]').html();
    saveEventOriginalContent = $('#save-event').html();

    $('#edit_event_form').submit(function(event) {
        submitForm(event, '/user/events/'+$('#eventId').val(), 'put');
    });

    $('#create_event_form').submit(function(event) {
        var $form = $(this);
        if ($form.data('submitted') === true) {
            // Previously submitted - don't submit again
            event.preventDefault();
        } else {
            // Mark it so that the next submit can be ignored
            $form.data('submitted', true);

            $('button[type="submit"]').html('<i class="fa fa-spinner  material-fa fa-spin fa-3x fa-fw"></i>');
            $('#save-event').html('<i class="fa fa-spinner material-fa fa-spin fa-3x fa-fw"></i>');
            submitForm(event, '/user/events', 'post');
        }
    });

    $('#save-event').click(function(event) {
        event.preventDefault();
        $('.event_form').submit();
    });


    $('#description').trigger('autoresize');
    /*$('#create_event_form').preventDoubleSubmission({
        timeout: 2000,
        submit: function(event) {
            var $form = $(this);
            return false;
        }
    });*/

    $('.choice').click(function(event){
        event.preventDefault();
        $(event.currentTarget).closest('.choices').find('.choice').removeClass('active');
        $(event.currentTarget).addClass('active');
        $("input[name='" + $(event.currentTarget).closest('.choices').data('input') + "']").val($(event.currentTarget).attr('data-value'));

        if($(event.currentTarget).data("info") !== undefined) {
            infoBlockId = '#' + $(event.currentTarget).data('info');
            $(infoBlockId).toggleClass('hide', false);
        } else {
            $(infoBlockId).toggleClass('hide', true);
        }
    });

    $('.default-focus').first().focus();
});

function submitForm(event, path, httpMethod)
{
    event.preventDefault();
    $("input[name='startDateTime']").val(($("input[name='startDate']").val()+' '+$("input[name='startTime']").val()+':00'));
    ApiClient1[httpMethod](
        path,
        $("input[name='startDateTime'], input[name='title'], input[name='address'], input[name='placeExternalId'], textarea[name='description'], select[name='maximumCapacity'], input[name='public']").serialize(),
        function(msg) {
            handleReturn(msg);
        }
    );
}

function handleReturn(xhr)
{
    if(xhr.status !== 201 && xhr.status != 200) {
        prepareFormErrorMessage(xhr);
        $('#edit_event_form').data('submitted', false);
        $('#create_event_form').data('submitted', false);
        $('button[type="submit"]').html(submitOriginalContent);
        $('#save-event').html(saveEventOriginalContent);
    } else {
        $('#form-error-block').toggleClass('hide', true);
        event = xhr.responseJSON;
        redirectUrl = CREATE_EVENT_SUCCESS_URL_PATH.replace('{eventId}', event.id);
        window.location.href = redirectUrl;
    }
}

function prepareFormErrorMessage(xhr)
{
    var msg = '';
    if(xhr.responseJSON.hasOwnProperty('errors') && xhr.responseJSON.errors.hasOwnProperty('children')) {
        var errors = xhr.responseJSON.errors.children;
        for (var k in errors) {
            if (errors.hasOwnProperty(k)) {
                if (errors[k].hasOwnProperty('errors')) {
                    if ('title' == k) {
                        msg += '<li>Title can not be empty</li>';
                        $("input[name='title']").addClass('invalid');
                        $("label[for='title']").attr('data-error', 'Title can not be empty');
                    }
                    if ('address' == k) {
                        msg += '<li>Address can not be empty</li>';
                        $("input[name='address']").addClass('invalid');
                        $("label[for='address']").attr('data-error', 'Address can not be empty');
                    }
                    if ('startDateTime' == k) {
                        msg += '<li>Date can not be empty</li>';
                        msg += '<li>Time can not be empty</li>';
                        $("input[name='startDate']").addClass('invalid');
                        $("label[for='startDate']").attr('data-error', 'Date can not be empty');
                        $("input[name='startTime']").addClass('invalid');
                        $("label[for='startTime']").attr('data-error', 'Time can not be empty');
                    }

                }
            }
        }
    } else if(xhr.responseJSON.hasOwnProperty('message')) {
        if(xhr.responseJSON.message == 'cannot_edit_past_event') {
            msg = 'Cannot edit finished event.';
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
    $('#form-error-message').html(msg);
    $('#form-error-block').toggleClass('hide', false);
}