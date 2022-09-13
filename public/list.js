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
        success: (result) => {
            if (result.status === 200) {
                console.log('create dashboard success');
            }
            window.location.href = `/api/1.0/dashboards/${result}`;
        },
    });
});

$(document).ready(function () {
    $('.delete').on('click', function () {
        console.log($(this).attr('value'));
        const data = {
            userId: $('.d-block').text(),
            dashboardId: $(this).attr('value'),
        };
        $.ajax({
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            url: '/api/1.0/dashboard-list/delete',
            data: JSON.stringify(data),
            error: (err) => {
                console.log(err);
            },
            success: (result) => {
                if (result.status === 200) {
                    console.log('delete dashboard success');
                }
                window.location.href = `/api/1.0/dashboard-list`;
            },
        });
    });
});
