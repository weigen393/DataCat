$('.create-alert').on('click', () => {
    window.location.href = `/notify/new`;
});

jQuery(function ($) {
    $('.delete').on('click', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                console.log($(this).attr('value'));
                const data = {
                    notifyId: $(this).attr('value'),
                };
                await $.ajax({
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    url: '/api/1.0/notify-list/delete',
                    data: JSON.stringify(data),
                    error: (err) => {
                        console.log(err);
                    },
                    success: async (result) => {
                        if (result.status === 200) {
                            console.log('delete notify success');
                        }
                        await Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
                        window.location.href = `/notify-list`;
                    },
                });
            }
        });
    });
});
$('.sidebar-notify').css('background-color', 'rgba(255, 255, 255, 0.1)');
$('.sidebar-notify').css('color', '#fff');
