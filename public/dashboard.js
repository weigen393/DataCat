const dashboardData = data;
const chartId = [];
const interval = [];
const maxText = 40;
const maxTitleText = 30;
Swal.fire({
    title: 'Loading ...',
    width: 600,
    padding: '1.5em 3em 3em 3em',
    color: '#716add',
    backdrop: `
      rgba(0,0,123,0.4)
      url("/images/nyan-cat-nyan.gif")
      left bottom
      no-repeat
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
});
async function wrap() {
    await showAll();
    Swal.fire({
        title: 'Loading ...',
        timer: 10,
        showCancelButton: false,
        showConfirmButton: false,
    });
}
wrap();
async function showAll() {
    for (let i = 0; i < dashboardData.charts.length; i++) {
        var value = {
            layer: dashboardData.charts[i].layer,
            type: dashboardData.charts[i].type,
            host: dashboardData.charts[i].host,
            container: dashboardData.charts[i].container,
            measurement: dashboardData.charts[i].measurement,
            field: dashboardData.charts[i].field,
            info: dashboardData.charts[i].info,
            timeRange: dashboardData.charts[i].timeRange,
            timeInterval: dashboardData.charts[i].interval,
            aggregate: dashboardData.charts[i].aggregate,
        };
        // console.log(value);
        chartId.push(i);
        // chartId.push(dashboardData.charts[i]._id);
        interval.push(dashboardData.charts[i].interval);
        await $.ajax({
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
            url: '/api/1.0/chart/show',
            data: value,
            error: (err) => {
                // console.log(err);
            },
            success: async (result) => {
                if (result.status === 200) {
                    // console.log('success');
                }
                // console.log('result', result);
                if (dashboardData.charts[i].type === 'line') {
                    await showLineChart(result, i);
                } else if (dashboardData.charts[i].type === 'number') {
                    await showNumber(result, i);
                }

                realTime(i, dashboardData.charts[i].interval);
            },
        });
    }
}

async function realTime(i, interval) {
    var value = {
        layer: dashboardData.charts[i].layer,
        type: dashboardData.charts[i].type,
        host: dashboardData.charts[i].host,
        container: dashboardData.charts[i].container,
        measurement: dashboardData.charts[i].measurement,
        field: dashboardData.charts[i].field,
        info: dashboardData.charts[i].info,
        timeRange: dashboardData.charts[i].timeRange,
        timeInterval: dashboardData.charts[i].interval,
        aggregate: dashboardData.charts[i].aggregate,
    };
    await $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/show',
        data: value,
        error: (err) => {
            // console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                // console.log('success');
            }
            // console.log('result', result);
            if (dashboardData.charts[i].type === 'line') {
                showLineChart(result, i);
            } else if (dashboardData.charts[i].type === 'number') {
                showNumber(result, i);
            }
        },
    });
    let time = interval.slice(0, -1);
    if (interval.slice(-1) === 's') {
        time = +interval.slice(0, -1);
    } else if (interval.slice(-1) === 'm') {
        time = +interval.slice(0, -1) * 60;
    }
    // console.log(time);
    setTimeout(() => {
        realTime(i, interval);
    }, 1000 * time);
}
function showLineChart(data, num) {
    const value = [];
    const time = [];
    for (let i = 0; i < data.length; i++) {
        value.push([Date.parse(data[i]._time), data[i]._value]);
        time.push(data[i]._time);
    }
    var line_data1 = {
        data: value,
        color: '#356fe2',
    };
    $.plot(`#line-chart-${num}`, [line_data1], {
        colors: '#ffffff',
        grid: {
            hoverable: true,
            borderColor: '#3f2cb3',
            borderWidth: 1,
            tickColor: '#3f2cb3',
            backgroundColor: '#130d40',
        },
        series: {
            shadowSize: 0,
            lines: {
                show: true,
                lineWidth: 4,
            },
            points: {
                show: false,
            },
        },

        yaxis: {
            show: true,
        },
        xaxis: {
            mode: 'time',
            timezone: 'browser',
            timeBase: 'milliseconds',
            timeformat: '%H:%M:%S',
            show: true,
        },
    });
    // $('.tickLabel').css('color', 'white');
    //Initialize tooltip on hover
    $('<div class="tooltip-inner" id="line-chart-tooltip"></div>')
        .css({
            position: 'absolute',
            display: 'none',
            opacity: 0.8,
            color: '#ffffff',
        })
        .appendTo('body');
    $(`#line-chart-${num}`).bind('plothover', function (event, pos, item) {
        if (item) {
            var x = item.datapoint[0].toFixed(2),
                y = item.datapoint[1].toFixed(2);

            $('#line-chart-tooltip')
                // .html(item.series.label + ' of ' + x + ' = ' + y)
                .html(y)
                .css({
                    top: item.pageY + 5,
                    left: item.pageX + 5,
                    color: '#ffffff',
                })
                .fadeIn(200);
        } else {
            $('#line-chart-tooltip').hide();
        }
    });
}
function showNumber(data, num) {
    const lastNum = data.pop();
    // console.log(lastNum._value);
    $(`#number-${num}`).text(lastNum._value.toFixed(2)).attr('class', 'card-number');
}
$('.create-chart').on('click', () => {
    window.location.href = `/dashboards/${dashboardData._id}/charts/new`;
});
$('.edit-title-btn').on('click', () => {
    // console.log('edit');
    $('.dashboard-title').css('display', 'none');
    $('.title-input').css('display', 'block');
    $('.title-input').attr('value', $('.dashboard-title').text());
    $('.edit-title-btn').css('visibility', 'hidden');
    $('.title-input').trigger('focus');
    $('.title-input').on('blur', async () => {
        // console.log('change');
        $('.title-input').css('display', 'none');
        $('.dashboard-title').css('display', 'block');
        const text = {
            title: $('.title-input').val(),
            description: $('.dashboard-description').text(),
        };
        // console.log('text', text);
        const checkTitle = await checkText(text.title, '.title-input', 'title');
        if (checkTitle) {
            await $.ajax({
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                url: `/api/1.0/dashboards/${dashboardData._id}/text`,
                data: JSON.stringify(text),
                error: (err) => {
                    // console.log(err);
                },
                success: (result) => {
                    if (result.status === 200) {
                        // console.log('success');
                    }
                    // console.log('r', result);
                    $('.edit-title-btn').css('visibility', 'visible');
                    $('.dashboard-title').text($('.title-input').val());
                    // $('.dashboard-description').text();
                },
            });
        }
    });
});
$('.edit-description-btn').on('click', () => {
    // console.log('edit');
    $('.dashboard-description').css('display', 'none');
    $('.description-input').css('display', 'block');
    $('.description-input').attr('value', $('.dashboard-description').text());
    $('.edit-description-btn').css('visibility', 'hidden');
    $('.description-input').trigger('focus');
    $('.description-input').on('blur', async () => {
        // console.log('change');
        $('.description-input').css('display', 'none');
        $('.dashboard-description').css('display', 'block');
        const text = {
            title: $('.dashboard-title').text(),
            description: $('.description-input').val(),
        };
        // console.log('text', text);
        const checkTitle = await checkText(text.description, '.description-input', 'description');
        if (checkTitle) {
            await $.ajax({
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                url: `/api/1.0/dashboards/${dashboardData._id}/text`,
                data: JSON.stringify(text),
                error: (err) => {
                    // console.log(err);
                },
                success: (result) => {
                    if (result.status === 200) {
                        // console.log('success');
                    }
                    // console.log('r', result);
                    $('.edit-description-btn').css('visibility', 'visible');
                    $('.dashboard-description').text($('.description-input').val());
                    // $('.dashboard-description').text();
                },
            });
        }
    });
});

async function checkText(text, element, name) {
    // console.log(text);
    let textLimit;
    if (name === 'title') {
        textLimit = maxTitleText;
    } else if (name === 'description') {
        textLimit = maxText;
    }

    if (text.length > textLimit) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Dashboard ${name} is too long!`,
        }).then(() => {
            $(`.dashboard-${name}`).css('display', 'none');
            $(element).css('display', 'block');
            $(element).trigger('focus');
            // console.log('hello');
        });
        return 0;
    } else if (text.includes('<') || text.includes('>')) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Dashboard ${name} includes invalid symbol!`,
        }).then(() => {
            $(element).focus();
        });
        return 0;
    } else {
        return 1;
    }
}
jQuery(function ($) {
    $('.btn').on('click', function () {
        // console.log($(this).attr('value'));
        // console.log($(this).attr('name'));
        const method = $(this).attr('name');
        const chartId = $(this).attr('value');
        if (method === 'edit') {
            window.location.href = `/dashboards/${dashboardData._id}/charts/${chartId}`;
        } else if (method === 'delete') {
            delChart(chartId);
        }
    });
});
async function delChart(chartId) {
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
            const sendData = {
                dashboardId: dashboardData._id,
                chartId: chartId,
            };
            await $.ajax({
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                url: '/api/1.0/chart/delete',
                data: JSON.stringify(sendData),
                error: (err) => {
                    // console.log(err);
                },
                success: async (result) => {
                    if (result.status === 200) {
                        // console.log('success');
                    }
                    // console.log('result', result);
                    await Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
                    window.location.href = `/dashboards/${dashboardData._id}`;
                },
            });
        }
    });
}
$('.sidebar-dashboard').css('background-color', 'rgba(255, 255, 255, 0.1)');
$('.sidebar-dashboard').css('color', '#fff');

let sse = new EventSource('/stream');
sse.onmessage = function (e) {
    const msg = e.data.slice(1, -1);
    if (msg.split(',')[0] === 'Warning') {
        Swal.fire({ title: 'Warning', text: `${msg.split(',')[1]}`, icon: 'warning' });
    } else if (msg.split(',')[0] === 'Notice') {
        Swal.fire({ title: 'Notice', text: `${msg.split(',')[1]}`, icon: 'success' });
    } else {
        Swal.fire(`${msg.split(',')[0]}`);
    }
    // console.log(e.data);
};
