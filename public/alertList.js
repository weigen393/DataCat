$('.create-alert').on('click', () => {
    window.location.href = `/api/1.0/alerts/new`;
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
                    alertId: $(this).attr('value'),
                };
                await $.ajax({
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    url: '/api/1.0/alert-list/delete',
                    data: JSON.stringify(data),
                    error: (err) => {
                        console.log(err);
                    },
                    success: async (result) => {
                        if (result.status === 200) {
                            console.log('delete alert success');
                        }
                        await Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
                        window.location.href = `/api/1.0/alert-list`;
                    },
                });
            }
        });
    });
});
