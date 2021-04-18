$(document).ready(function() {
    $('.plan-selection').click(function(event) {
        event.preventDefault();
        ApiClient1.post(
            '/user/subscriptions',
            {'planName': $(event.currentTarget).data('name')},
            function(msg) {
                handleReturn(msg);
            }
        );
    });


});

function handleReturn(xhr)
{
    if(xhr.status !== 201 && xhr.status !== 200) {
        prepareFormErrorMessage(xhr);
    } else {
        $('#form-error-block').toggleClass('hide', true);
        window.location.href = SUBSCRIPTION_SUCCESS_URL_PATH;
    }
}