const dashboardData = data;
const systemMap = {
    number: {
        system: ['uptime', 'n_cpus'],
        mem: 'total',
    },
    chart: {
        mem: 'used_percent',
        disk: 'used_percent',
        net: ['bytes_sent', 'bytes_recv'],
        cpu: 'cpu_total',
    },
};
let measurementNum = 0;
let hostValue = [];
let containerValue = [];
let measurementValue = [];
let fieldValue = [];
$('#layer').change(() => {
    if ($('#layer').val() === 'container') {
        const layer = $('#layer').val();
        const type = $('#type').val();
        const data = {
            layer: layer,
            type: type,
        };
        let container = [];
        $.ajax({
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
            url: '/api/1.0/chart/container',
            data: JSON.stringify(data),
            error: (err) => {
                console.log(err);
            },
            success: (result) => {
                if (result.status === 200) {
                    console.log('success');
                }
                container = result;
                console.log('result', result);
                containerValue = container;
                $('.button-container').html(``);
                $('.button-container')
                    .html(`<button class="btn btn-info dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Container Name
                          </button>       
                          <ul class="dropdown-menu container">`);
                for (let i = 0; i < container.length; i++) {
                    $('.container').append(
                        `<li>
                          <a href="#" class="dropdown-item" id="container-list">
                            <div class="form-check">
                              <input class="form-check-input container${i}" data-value="${container[i]}" name="${container[i]}" type="checkbox" onclick="container('container')" id="flexCheckDefault">
                                <label class="form-check-label" for="flexCheckDefault">
                                  ${container[i]}
                                </label>
                            </div>
                          </a>
                        </li>`
                    );
                }
            },
        });
    } else {
        $('.button-container').html(``);
    }
});
function container() {
    console.log('container');
}
$('#type').change(() => {
    const layer = $('#layer').val();
    const type = $('#type').val();
    const data = {
        layer: layer,
        type: type,
    };
    $('.host').html(``);
    $('.measurement').html(``);
    $('.field').html(``);
    if (layer === 'system') {
        if (type === 'number') {
            const measurement = Object.keys(systemMap.number);
            console.log(measurement);
            for (let i = 0; i < measurement.length; i++) {
                $('.measurement').append(
                    `<li>
                      <a href="#" data-value="${measurement[i]}" class="dropdown-item">
                        <input type="radio" name="measurement">
                          <label>
                            ${measurement[i]}
                          </label>
                      </a>
                    </li>`
                );
            }
        } else if (type === 'chart') {
            const measurement = Object.keys(systemMap.chart);
            console.log(measurement);
            measurementNum = measurement.length;
            for (let i = 0; i < measurement.length; i++) {
                $('.measurement').append(
                    `<li>
                      <a href="#" class="dropdown-item" id="measurement-list">
                        <div class="form-check">
                          <input class="form-check-input measurement${i}" data-value="${measurement[i]}" name="${measurement[i]}" type="checkbox" onclick="measurement('system','chart')" id="flexCheckDefault">
                            <label class="form-check-label" for="flexCheckDefault">
                              ${measurement[i]}
                            </label>
                        </div>
                      </a>
                    </li>`
                );
            }
        }
    } else if (layer === 'container') {
    }

    let host = [];
    $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/host',
        data: JSON.stringify(data),
        error: (err) => {
            console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            host = result;
            console.log('result', result);
            hostValue = host;
            $('.host').html(``);
            for (let i = 0; i < host.length; i++) {
                $('.host').append(
                    `<li>
                      <a href="#" data-value="system" class="dropdown-item">
                        <div class="form-check">
                          <input class="form-check-input host${i}" type="checkbox" onclick="host(${host.length})">
                            <label class="form-check-label" for="flexCheckDefault">
                              ${host[0]}
                            </label>
                        </div>
                      </a>
                    </li>`
                );
            }
        },
    });
});
function measurement(layer, type) {
    const measurementList = [];
    for (let i = 0; i < measurementNum; i++) {
        if ($(`.form-check-input.measurement${i}`).is(':checked')) {
            measurementList.push($(`.form-check-input.measurement${i}`).data('value'));
        }
    }

    console.log(measurementList);
    measurementValue = measurementList;
    console.log(layer, type);
    const field = [];
    if (layer === 'system') {
        if (type === 'chart') {
            for (let i = 0; i < measurementList.length; i++) {
                const fieldList = systemMap[type][measurementList[i]];
                console.log(typeof fieldList);
                if (typeof fieldList === 'object') {
                    field.push(...fieldList);
                } else {
                    if (!field.includes(fieldList)) {
                        field.push(fieldList);
                    }
                }
            }
        }
    }
    console.log(field);
    $('.field').html(``);
    for (let i = 0; i < field.length; i++) {
        $('.field').append(
            `<li>
              <a href="#" class="dropdown-item" id="measurement-list">
                <div class="form-check"><input class="form-check-input field${i}" data-value="${field[i]}" name="${field[i]}" type="checkbox" onclick="field(${field.length})" id="flexCheckDefault">
                  <label class="form-check-label" for="flexCheckDefault">
                    ${field[i]}
                  </label>
                </div>
              </a>
            </li>`
        );
    }
}
function field(num) {
    const fieldList = [];
    for (let i = 0; i < num; i++) {
        if ($(`.form-check-input.field${i}`).is(':checked')) {
            fieldList.push($(`.form-check-input.field${i}`).data('value'));
        }
    }
    fieldValue = fieldList;
    console.log(fieldList);
}
function host(num) {
    const hostList = [];
    for (let i = 0; i < num; i++) {
        if ($(`.form-check-input.host${i}`).is(':checked')) {
            hostList.push(hostValue[i]);
        }
    }
    console.log(hostList);
}
$('#preview').on('click', () => {
    console.log('preview');
    console.log(hostValue, measurementValue, fieldValue);
    //get data
    const data = {
        layer: $('#layer').val(),
        type: $('#type').val(),
        host: hostValue,
        measurement: measurementValue,
        field: fieldValue,
        timeRange: $('#range').val(),
        timeInterval: $('#interval').val(),
    };
    console.log(data);
    $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/show',
        data: data,
        error: (err) => {
            console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
            showChart(result);
        },
    });
});
function showChart(data) {
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
    $.plot('#line-chart', [line_data1], {
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
    $('#line-chart').bind('plothover', function (event, pos, item) {
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
$('#save').on('click', () => {
    const data = {
        dashboardId: dashboardData.dashboardId,
        title: $('.chartTitle').text(),
        layer: $('#layer').val(),
        type: $('#type').val(),
        host: hostValue,
        measurement: measurementValue,
        field: fieldValue,
        timeRange: $('#range').val(),
        interval: $('#interval').val(),
    };
    console.log(data);
    $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/save',
        data: JSON.stringify(data),
        error: (err) => {
            console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
            window.location.href = `/api/1.0/dashboards/${dashboardData.dashboardId}`;
        },
    });
});
