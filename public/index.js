$('.sign-up').on('click', () => {
    $('.sign-up-box').css('display', 'flex');
    $('.sign-in-box').css('display', 'none');
});
$('.sign-in').on('click', () => {
    $('.sign-in-box').css('display', 'flex');
    $('.sign-up-box').css('display', 'none');
});

$('.signUp').on('click', async () => {
    console.log('sign up');
    const data = {
        name: $('.signUpName').val(),
        email: $('.signUpEmail').val(),
        password: $('.signUpPwd').val(),
    };
    console.log(data);
    await $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: `/api/1.0/user/signup`,
        data: JSON.stringify(data),
        error: (err) => {
            console.log(err);
            console.log(err.responseText);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            window.location.href = `/api/1.0/dashboard-list/${result.id}`;
        },
    });
});
$('.signIn').on('click', async () => {
    console.log('sign in');
    const data = {
        email: $('.signInEmail').val(),
        password: $('.signInPwd').val(),
    };
    console.log(data);
    await $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: `/api/1.0/user/signin`,
        data: JSON.stringify(data),
        error: (err) => {
            console.log(err);
            console.log(err.responseText);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            window.location.href = `/api/1.0/dashboard-list/${result.id}`;
        },
    });
});
