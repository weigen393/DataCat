// const Swal = require('sweetalert2');
// if (!!window.EventSource) {
// var source = new EventSource('/streaming');
// source.addEventListener(
//     'message',
//     function (e) {
//         console.log('Got', e);
//         $('.dashboard-title').val(e.data);
//         // document.getElementById('data').innerHTML = e.data;
//     },
//     false
// );
// source.addEventListener(
//     'open',
//     function (e) {
//         document.getElementById('state').innerHTML = 'Connected';
//     },
//     false
// );
// source.addEventListener(
//     'error',
//     function (e) {
//         const id_state = document.getElementById('state');
//         if (e.eventPhase == EventSource.CLOSED) source.close();
//         if (e.target.readyState == EventSource.CLOSED) {
//             id_state.innerHTML = 'Disconnected';
//         } else if (e.target.readyState == EventSource.CONNECTING) {
//             id_state.innerHTML = 'Connecting...';
//         }
//     },
//     false
// );
// } else {
//     console.log("Your browser doesn't support SSE");
// }
// const source = new EventSource('/streaming');

// source.addEventListener('message', (message) => {
//     console.log('Got', message);

//     // Display the event data in the `content` div
//     $('.dashboard-title').val(message.data);
// });
$('.create-dashboard').on('click', () => {
    console.log('create');
    const data = {
        userId: $('.d-block').text(),
        title: 'title',
        description: 'description',
        charts: [],
    };
    $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/dashboard-list/add',
        data: JSON.stringify(data),
        error: (err) => {
            console.log(err);
        },
        success: async (result) => {
            if (result.status === 200) {
                console.log('create dashboard success');
            }
            await Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'A new dashboard has been created',
                showConfirmButton: false,
                timer: 1500,
            });
            window.location.href = `/api/1.0/dashboards/${result}`;
        },
    });
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
                    dashboardId: $(this).attr('value'),
                };
                await $.ajax({
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    url: '/api/1.0/dashboard-list/delete',
                    data: JSON.stringify(data),
                    error: (err) => {
                        console.log(err);
                    },
                    success: async (result) => {
                        if (result.status === 200) {
                            console.log('delete dashboard success');
                        }
                        await Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
                        window.location.href = `/api/1.0/dashboard-list`;
                    },
                });
            }
        });
    });
});
