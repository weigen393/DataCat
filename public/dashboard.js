const dashboardData = data;

showAll();
function showAll() {
    for (let i = 0; i < dashboardData.charts.length; i++) {
        var value = {
            layer: dashboardData.charts[i].layer,
            type: dashboardData.charts[i].type,
            host: dashboardData.charts[i].host,
            measurement: dashboardData.charts[i].measurement,
            field: dashboardData.charts[i].field,
            timeRange: dashboardData.charts[i].timeRange,
            timeInterval: dashboardData.charts[i].interval,
            aggregate: dashboardData.charts[i].aggregate,
        };
        console.log(value);
        $.ajax({
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
            url: '/api/1.0/chart/show',
            data: value,
            error: (err) => {
                console.log(err);
            },
            success: (result) => {
                if (result.status === 200) {
                    console.log('success');
                }
                console.log('result', result);
                showChart(result, i);
            },
        });
    }
}

function showChart(data, num) {
    const value = [];
    const time = [];
    for (let i = 0; i < data.length; i++) {
        value.push([Date.parse(data[i]._time), data[i]._value]);
        time.push(data[i]._time);
    }
    var line_data1 = {
        data: value,
        color: '#3c8dbc',
    };
    $.plot(`#line-chart-${num}`, [line_data1], {
        grid: {
            hoverable: true,
            borderColor: '#f3f3f3',
            borderWidth: 1,
            tickColor: '#f3f3f3',
        },
        series: {
            shadowSize: 0,
            lines: {
                show: true,
            },
            points: {
                show: false,
            },
        },
        lines: {
            fill: false,
            color: ['#3c8dbc'],
        },
        yaxis: {
            show: true,
        },
        xaxis: {
            mode: 'time',
            timezone: 'browser',
            timeformat: '%Y-%m-%d %H:%M:%S',
            show: true,
        },
    });
    //Initialize tooltip on hover
    $('<div class="tooltip-inner" id="line-chart-tooltip"></div>')
        .css({
            position: 'absolute',
            display: 'none',
            opacity: 0.8,
        })
        .appendTo('body');
    $(`#line-chart-${num}`).bind('plothover', function (event, pos, item) {
        if (item) {
            var x = item.datapoint[0].toFixed(2),
                y = item.datapoint[1].toFixed(2);

            $('#line-chart-tooltip')
                .html(item.series.label + ' of ' + x + ' = ' + y)
                .css({
                    top: item.pageY + 5,
                    left: item.pageX + 5,
                })
                .fadeIn(200);
        } else {
            $('#line-chart-tooltip').hide();
        }
    });
}
$('.create-chart').on('click', () => {
    window.location.href = `/api/1.0/dashboards/${dashboardData._id}/charts/new`;
});
$('h1').blur(() => {
    console.log('change');
    const text = {
        title: $('.dashboard-title').text(),
        description: $('.dashboard-description').text(),
    };

    $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: `/api/1.0/dashboards/${dashboardData._id}/text`,
        data: JSON.stringify(text),
        error: (err) => {
            console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
        },
    });
});

$(document).ready(function () {
    $('.btn').on('click', function () {
        console.log($(this).attr('value'));
        console.log($(this).attr('name'));
        const method = $(this).attr('name');
        const chartId = $(this).attr('value');
        if (method === 'edit') {
            // window.location.href = `/api/1.0/dashboards/${dashboardData._id}/charts/new`;
        } else if (method === 'delete') {
            delChart(chartId);
        }
    });
});
function delChart(chartId) {
    const sendData = {
        dashboardId: dashboardData._id,
        chartId: chartId,
    };
    $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/delete',
        data: JSON.stringify(sendData),
        error: (err) => {
            console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
            window.location.href = `/api/1.0/dashboards/${dashboardData._id}`;
        },
    });
}
