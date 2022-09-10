$('.create-dashboard').on('click', () => {
    // console.log(Date.now().toString());
    const dashboardId = Date.now().toString().substring(3);
    console.log(dashboardId);
    console.log($('.d-block').text());
    console.log('create');
    //打api存mongo
    const data = {
        userId: $('.d-block').text(),
        dashboardId: dashboardId,
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
                console.log('success');
            }
            //redirect到dashboards
            window.location.href = `/dashboards/${dashboardId}`;
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
                    console.log('success');
                }
                //redirect到dashboards
                window.location.href = `/api/1.0/dashboard-list`;
            },
        });
    });
});
