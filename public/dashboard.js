const show = data;
function showAll() {
    for (let i = 0; i < show.charts.length; i++) {
        var value = {
            layer: show.charts[i].layer,
            type: show.charts[i].type,
            host: show.charts[i].host,
            measurement: show.charts[i].measurement,
            field: show.charts[i].field,
            timeRange: show.charts[i].timeRange,
            timeInterval: show.charts[i].interval,
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
showAll();
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
    const chartId = Date.now().toString().substring(3);
    console.log(chartId);
    console.log($('.dashboardId').text());
    window.location.href = `/api/1.0/dashboards/${$('.dashboardId').text()}/charts/new`;
});
