$('.sign-up').on('click', () => {
    console.log('sign up');
    $('.sign-up-box').css('display', 'flex');
    $('.sign-in-box').css('display', 'none');
});
$('.sign-in').on('click', () => {
    console.log('sign in');
    $('.sign-in-box').css('display', 'flex');
    $('.sign-up-box').css('display', 'none');
});
