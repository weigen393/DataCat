const notifyData = data;
const maxText = 40;
if (notifyData.notifyId !== undefined) {
    console.log('it is not new');
    resetNotify(notifyData.notifyId);
}
async function resetNotify(notifyId) {
    const sendData = {
        notifyId: notifyId,
    };
    console.log(sendData);
    let setData;
    await $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/notify/edit',
        data: sendData,
        error: (err) => {
            console.log(err);
        },
        success: async (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
            setData = result;

            $(`select option[value=${setData.sendType}]`).attr('selected', true);
            if (setData.sendType === 'email') {
                $('.notify-text').html(`<p class='text'>Send to email:</p>                  
                  <input id='email' placeholder='email address'>`);
                $('#email').attr('value', setData.email);
            } else if (setData.sendType === 'discord') {
                $('.notify-text').html(`<p class='text'>id:</p>                  
      <input id='id' placeholder='id'><br><p class='text'>token:</p>                  
      <input id='token' placeholder='token'>`);
                $('#id').attr('value', setData.id);
                $('#token').attr('value', setData.token);
            }
        },
    });
}
$('#notifyType').on('change', () => {
    const notifyType = $('#notifyType').val();
    if (notifyType === 'email') {
        $('.notify-text').html(`<p class='text'>Send to email:</p>                  
                  <input id='email' placeholder='email address'>`);
    } else if (notifyType === 'discord') {
        $('.notify-text').html(`<p class='text'>id:</p>                  
      <input id='id' placeholder='id'><br><p class='text'>token:</p>                  
      <input id='token' placeholder='token'>`);
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
    } else if (title.includes('<') || title.includes('>')) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Alert title includes invalid symbol!`,
        }).then(() => {
            $('.alert-title').focus();
        });
    } else if (description.length > maxText) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Alert description is too long!`,
        }).then(() => {
            $('.alert-description').focus();
        });
    } else if (description.includes('<') || description.includes('>')) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Alert description includes invalid symbol!`,
        }).then(() => {
            $('.alert-description').focus();
        });
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
    console.log(data);
    await $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/notify/save',
        data: JSON.stringify(data),
        error: (err) => {
            console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
            // const sendData = {
            //     alertId: result.alertId,
            //     schedule: result.schedule,
            // };
            // setAlert(sendData);
            window.location.href = `/notify-list`;
        },
    });
}
