$('.sidebar-logout').on('click', async function () {
    await $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: `/api/1.0/user/logout`,
        error: (err) => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.responseText,
            });
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            window.location.href = `/`;
        },
    });
});
