$(document).ready(function() {
    ApiClient1.get(
        '/community_invitation/user',
        null,
        function(msg) {
            handleDefaultData(msg);
        }
    );

    $('#complete_profile_form').submit(function(event) {
        event.preventDefault();
        ApiClient1.put(
            '/user/profile',
            $(event.currentTarget).serialize(),
            function(msg) {
                handleReturn(msg);
            }
        );
    });

    $('#save-profile').click(function(event) {
        event.preventDefault();
        $('#complete_profile_form').submit();
    });

    $('#gender_male').click(function(event){
        event.preventDefault();
        $('#gender_male').addClass('active');
        $('#gender_female').removeClass('active');
        $('#gender').val($('#gender_male').attr('data-value'));
    });
    $('#gender_female').click(function(event){
        event.preventDefault();
        $('#gender_female').addClass('active');
        $('#gender_male').removeClass('active');
        $('#gender').val($('#gender_female').attr('data-value'));
    });


    maxBirthDate = new Date();
    maxBirthDate.setFullYear(new Date().getFullYear() - 16);
    $('.birth_datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 90, // Creates a dropdown of 15 years to control year,
        format: 'dd mmm, yyyy',
        formatSubmit: 'yyyy-mm-dd',
        onSet: function( arg ){
            if ( 'select' in arg ){ //prevent closing on selecting month/year
                this.close();
            }
        },
        hiddenName: true,
        max: maxBirthDate

    });

});

function handleDefaultData(xhr)
{
    if(xhr.status === 200) {
        var firstName = xhr.responseJSON.firstName;
        $("input[name='firstName']").val(firstName);
        $("input[name='lastName']").val(xhr.responseJSON.lastName);
    }
}

function handleReturn(xhr)
{
    if(xhr.status !== 201 && xhr.status !== 200) {
        prepareFormErrorMessage(xhr);
    } else {
        $('#form-error-block').toggleClass('hide', true);
        window.location.href = COMPLETE_PROFILE_SUCCESS_URL_PATH;
    }
}

function prepareFormErrorMessage(xhr)
{
    var msg = '';
    var errors = xhr.responseJSON.errors.children;

    for (var k in errors){
        if (errors.hasOwnProperty(k)) {
            if(errors[k].hasOwnProperty('errors')) {
                if('firstName' == k) {
                    msg += '<li>First name can not be empty</li>';
                    $("input[name='firstName']").addClass('invalid');
                    $("label[for='firstName']").attr('data-error', 'First name can not be empty').addClass('error');
                }
                if('lastName' == k) {
                    msg += '<li>Last name can not be empty</li>';
                    $("input[name='lastName']").addClass('invalid');
                    $("label[for='lastName']").attr('data-error', 'Last name can not be empty').addClass('error');
                }
                if('birthDate' == k) {
                    msg += '<li>Birth date can not be empty</li>';
                    $("input[name='birthDate']").addClass('invalid');
                    $("label[for='birthDate']").attr('data-error', 'Birth date can not be empty').addClass('error');;
                }
                if('nativeCountry' == k) {
                    msg += '<li>Native country can not be empty</li>';
                    $("input[name='nativeCountry']").addClass('invalid');
                    $("label[for='nativeCountry']").attr('data-error', 'Native country can not be empty').addClass('error');;
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
    $('#form-error-message').html(msg);
    $('#form-error-block').toggleClass('hide', false);
}