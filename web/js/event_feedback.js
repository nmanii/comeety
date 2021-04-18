$(document).ready(function() {
    $('#event_feedback').submit(function(event) {
        event.preventDefault();
        var data = getFormattedFormData($(event.currentTarget));

        ApiClient1.post(
            '/events/'+CURRENT_EVENT_ID+'/user/feedback',
            data,
            function(msg) {
                handleReturn(msg);
            }
        );

    });

    $('#save-evaluation').click(function(event) {
        event.preventDefault();
        $('#event_feedback').submit();
    });

    $('.choice').click(function(event){
        event.preventDefault();
        if($(event.currentTarget).hasClass('active')) {
            //If the user select an already selected value, we deselect it
            $(event.currentTarget).closest('.choices').find('.choice').removeClass('active');
            commentBlockId = '#' + $(event.currentTarget).closest('.choices').data('comment');
            $("input[name='" + $(event.currentTarget).closest('.choices').data('input') + "']").val('');
            //reset comment form
            $(commentBlockId).toggleClass('hide', true);
            $(commentBlockId + ' textarea').val(null);
        } else {
            $(event.currentTarget).closest('.choices').find('.choice').removeClass('active');
            $(event.currentTarget).addClass('active');
            $("input[name='" + $(event.currentTarget).closest('.choices').data('input') + "']").val($(event.currentTarget).attr('data-value'));

            commentBlockId = '#' + $(event.currentTarget).closest('.choices').data('comment');
            if ($(event.currentTarget).hasClass('allow-comment')) {
                $(commentBlockId).toggleClass('hide', false);
            } else {
                //reset comment form
                $(commentBlockId).toggleClass('hide', true);
                $(commentBlockId + ' textarea').val(null);
            }
        }
    });

    if(SELECTED_RATING !== '') {
        $('.choice[data-value="'+SELECTED_RATING+'"]').click();
    }


});

function getFormattedFormData(target)
{
    var data = {};
    var serializedForm = target.serializeArray();

    for (var key in serializedForm) {
        if (serializedForm.hasOwnProperty(key)) {
            var value = serializedForm[key];
            var previousArray = null;
            var data_key = value['name'].split('_');

            obj = {};

            category = data_key[1];
            info_key = data_key[2];

            obj['category'] = category;
            obj[info_key] = value['value'];

            if(!data.hasOwnProperty([data_key[0]])) {
                data[data_key[0]] = {};
            }
            if(!data[data_key[0]].hasOwnProperty(data_key[0]+'_'+category)) {
                data[data_key[0]][data_key[0]+'_'+category] = {};
            }
            data[data_key[0]][data_key[0]+'_'+category] = $.extend(data[data_key[0]][data_key[0]+'_'+category], obj);
        }
    }

    //remove data[key] if rating is empty
    for(var key in data) {
        if (data.hasOwnProperty(key)) {
            for(var key2 in data[key]) {
                if (data[key].hasOwnProperty(key2)) {
                    if (!data[key][key2].hasOwnProperty('rating') || data[key][key2]['rating'] == "") {
                        delete data[key][key2];
                    }
                }
            }
            if(jQuery.isEmptyObject(data[key])) {
                delete data[key];
            }
        }
    }

    //Move users evaluation in a dedicate subkey
    for(var key in data) {
        if (data.hasOwnProperty(key)) {
            if(key.match(/users([0-9]*)/i)) {
                if(!data.hasOwnProperty('users')) {
                    data['users'] = {};
                }
                data['users'] = $.extend(data['users'],data[key]);
                delete data[key];
            }
        }
    }



    return data;
}

function handleReturn(xhr)
{
    if(xhr.status !== 204) {
        prepareFormErrorMessage(xhr);
    } else {
        window.location = FEEDBACK_SUCCESS_URL_PATH;
    }
}

function prepareFormErrorMessage(xhr)
{
    var msg = '';
    var shouldHideForm = false;

    if(xhr.responseJSON.hasOwnProperty('errors') && xhr.responseJSON.errors.hasOwnProperty('children')) {
        var errors = xhr.responseJSON.errors.children;

        for (var k in errors) {
            if (errors.hasOwnProperty(k)) {
                if (errors[k].hasOwnProperty('errors')) {
                    if ('event' == k) {
                        msg += '<li>The event has not been rated.</li>';
                        $("input[name='event']").addClass('invalid');
                        $("label[for='event']").attr('data-error', 'Event feedback can not be empty').addClass('error');
                    }

                }
            }
        }
    } else if(xhr.responseJSON.code != 204) {
        if(xhr.responseJSON.message =='feedback_already_given') {
            msg = "You have already given a feedback for this event.";
            shouldHideForm = true;
        } else if(xhr.responseJSON.message =='not_registered_to_event') {
            msg = "You can only evaluate event where you did participate.";
            shouldHideForm = true;
        }
    }

    if (msg == '') {
        msg = 'An unidentified error occured.';
    }
    if(msg != '') {
        msg = 'Some errors occured: <ul>'+msg+'</ul>'
    }
    displayFormErrorMessage(msg, shouldHideForm);
}

function displayFormErrorMessage(msg, shouldHideForm)
{
    $('#form-message-block').find('.card-panel').first().addClass('error').html(msg);
    $('#form-message-block').toggleClass('hide', false);
    if(shouldHideForm) {
        $('#event_feedback').hide();
    }
    window.location = '#form-message-block';
}