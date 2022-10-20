const notifyData = data;
const maxText = 30;
const maxTitleText = 30;
if (notifyData.notifyId !== undefined) {
    // console.log('it is not new');
    resetNotify(notifyData.notifyId);
}
async function resetNotify(notifyId) {
    const sendData = {
        notifyId: notifyId,
    };
    // console.log(sendData);
    let setData;
    await $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/notify/edit',
        data: sendData,
        error: (err) => {
            // console.log(err);
        },
        success: async (result) => {
            if (result.status === 200) {
                // console.log('success');
            }
            // console.log('result', result);
            setData = result;
            $('.alert-title').text(setData.title);
            $('.alert-description').text(setData.description);
            $(`select option[value=${setData.sendType}]`).attr('selected', true);
            if (setData.sendType === 'email') {
                $('.notify-text').html('<div class="notify-id" ></div>');
                $('.notify-id').html(`<p class='text'>Send to email:</p>                  
                  <input id='email' placeholder='email address'>`);
                $('#email').attr('value', setData.email);
            } else if (setData.sendType === 'discord') {
                $('.notify-text').html('<div class="notify-id" ></div><div class="notify-token" ></div>');
                $('.notify-id').html(`<p class='text'>id:</p>                  
      <input id='id' placeholder='id'>`);
                $('.notify-token').html(`<p class='text'>token:</p>                  
      <input id='token' placeholder='token' type='password'>`);
                $('#id').attr('value', setData.id);
                $('#token').attr('value', setData.token);
            }
        },
    });
}
$('#notifyType').on('change', () => {
    const notifyType = $('#notifyType').val();
    if (notifyType === 'email') {
        $('.notify-text').html('<div class="notify-id" ></div>');
        $('.notify-id').html(`<p class='text'>Send to email:</p>                  
                  <input id='email' placeholder='email address'>`);
    } else if (notifyType === 'discord') {
        $('.notify-text').html('<div class="notify-id" ></div><div class="notify-token" ></div>');
        $('.notify-id').html(`<p class='text'>id:</p>                  
      <input id='id' placeholder='id'>`);
        $('.notify-token').html(`<p class='text'>token:</p>                  
      <input id='token' placeholder='token' type='password'>`);
    }
});
$('#save').on('click', async () => {
    $('#save').prop('disabled', true);
    const title = $('.alert-title').text();
    const description = $('.alert-description').text();
    if (title.length > maxText) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Alert title is too long!`,
        }).then(() => {
            $('.alert-title').focus();
        });
        // } else if (title.includes('<') || title.includes('>')) {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Oops...',
        //         text: `Alert title includes invalid symbol!`,
        //     }).then(() => {
        //         $('.alert-title').focus();
        //     });
    } else if (description.length > maxText) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Alert description is too long!`,
        }).then(() => {
            $('.alert-description').focus();
        });
        // } else if (description.includes('<') || description.includes('>')) {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Oops...',
        //         text: `Alert description includes invalid symbol!`,
        //     }).then(() => {
        //         $('.alert-description').focus();
        //     });
    } else {
        saveNotify();
    }
});
async function saveNotify() {
    const data = {
        notifyId: notifyData.notifyId,
        title: $('.alert-title').text(),
        description: $('.alert-description').text(),
        type: $('#notifyType').val(),
        email: $('#email').val(),
        id: $('#id').val(),
        token: $('#token').val(),
    };
    // console.log(data);
    await $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/notify/save',
        data: JSON.stringify(data),
        error: (err) => {
            // console.log(err);
        },
        success: async (result) => {
            if (result.status === 200) {
                // console.log('success');
            }
            // console.log('result', result);
            await Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Notify has been saved',
                showConfirmButton: false,
                timer: 1500,
            });
            window.location.href = `/notify-list`;
        },
    });
}
$('.edit-title-btn').on('click', () => {
    // console.log('edit');
    $('.alert-title').css('display', 'none');
    $('.title-input').css('display', 'block');
    $('.title-input').attr('value', $('.alert-title').text());
    $('.edit-title-btn').css('visibility', 'hidden');
    $('.title-input').trigger('focus');
    $('.title-input').on('blur', async () => {
        // console.log('change');
        $('.title-input').css('display', 'none');
        $('.alert-title').css('display', 'block');
        const text = {
            title: $('.title-input').val(),
            description: $('.alert-description').text(),
        };
        // console.log('text', text);
        const checkTitle = await checkText(text.title, '.title-input', 'title');
        if (checkTitle) {
            $('.edit-title-btn').css('visibility', 'visible');
            $('.alert-title').text($('.title-input').val());
        }
    });
});
$('.edit-description-btn').on('click', () => {
    // console.log('edit');
    $('.alert-description').css('display', 'none');
    $('.description-input').css('display', 'block');
    $('.description-input').attr('value', $('.alert-description').text());
    $('.edit-description-btn').css('visibility', 'hidden');
    $('.description-input').trigger('focus');
    $('.description-input').on('blur', async () => {
        // console.log('change');
        $('.description-input').css('display', 'none');
        $('.alert-description').css('display', 'block');
        const text = {
            title: $('.alert-title').text(),
            description: $('.description-input').val(),
        };
        // console.log('text', text);
        const checkTitle = await checkText(text.description, '.description-input', 'description');
        if (checkTitle) {
            $('.edit-description-btn').css('visibility', 'visible');
            $('.alert-description').text($('.description-input').val());
        }
    });
});

async function checkText(text, element, name) {
    // console.log(text);
    let textLimit;
    if (name === 'title') {
        textLimit = maxTitleText;
    } else if (name === 'description') {
        textLimit = maxText;
    }

    if (text.length > textLimit) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Dashboard ${name} is too long!`,
        }).then(() => {
            $(`.alert-${name}`).css('display', 'none');
            $(element).css('display', 'block');
            $(element).trigger('focus');
            // console.log('hello');
        });
        return 0;
        // } else if (text.includes('<') || text.includes('>')) {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Oops...',
        //         text: `Dashboard ${name} includes invalid symbol!`,
        //     }).then(() => {
        //         $(element).focus();
        //     });
        //     return 0;
    } else {
        return 1;
    }
}
