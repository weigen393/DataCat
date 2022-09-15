const dashboardData = data;
const systemMap = {
    cpu: ['usage_system'],
    disk: ['used', 'used_percent'],
    mem: ['used', 'used_percent', 'available', 'available_percent', 'total'],
    net: ['bytes_recv', 'bytes_sent', 'err_in', 'err_out'],
    processes: ['running', 'sleeping', 'stopped', 'idle', 'total'],
    system: ['n_cpus', 'uptime'],
};
const containerMap = {
    docker_container_cpu: ['usage_percent'],
    docker_container_mem: ['usage_percent'],
    docker_container_status: ['uptime_ns'],
    docker: ['n_containers', 'n_containers_paused', 'n_containers_running', 'n_containers_stopped'],
};
let measurementNum = 0;
let hostValue = [];
let containerValue = [];
let measurementValue = [];
let fieldValue = [];

if (dashboardData.chartId !== undefined) {
    console.log('it is not new');
    setChart(dashboardData.dashboardId, dashboardData.chartId);
}
function setChart(dashboardId, chartId) {
    const sendData = {
        chartId: chartId,
    };
    console.log(sendData);
    $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/edit',
        data: sendData,
        error: (err) => {
            console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
            const layer = result[0].layer;
            const measurement = result[0].measurement;
            resetHost(layer);
            if (layer === 'system') {
                $('.button-container').html(``);
                resetMeasurement(Object.keys(systemMap), layer);
            } else if (layer === 'container') {
                resetContainer();
            } else {
                $('.button-container').html(``);
            }
            resetField(measurement, layer);
            $('.chartTitle').text(result[0].title);
            $(`select option[value=${layer}]`).attr('selected', true);
            $(`select option[value=${result[0].type}]`).attr('selected', true);
            $(`select option[value=${result[0].timeRange}]`).attr('selected', true);
            $(`select option[value=${result[0].interval}]`).attr('selected', true);
            $(`select option[value=${result[0].aggregate}]`).attr('selected', true);
            //TODO: change method
            setTimeout(() => {
                hostValue = result[0].host;
                // containerValue = [];
                measurementValue = result[0].measurement;
                fieldValue = result[0].field;
                $(`input[data-value="${result[0].host[0]}"]`).attr('checked', true);
                $(`input[data-value="${result[0].measurement[0]}"]`).attr('checked', true);
                $(`input[data-value="${result[0].field[0]}"]`).attr('checked', true);
                showPreview();
            }, 3000);
        },
    });
}
$('#layer').change(() => {
    const layer = $('#layer').val();
    resetHost(layer);
    if (layer === 'system') {
        $('.button-container').html(``);
        resetMeasurement(Object.keys(systemMap), layer);
    } else if (layer === 'container') {
        resetContainer();
        resetMeasurement(Object.keys(containerMap), layer);
    } else {
        $('.button-container').html(``);
    }
});

function resetHost(layer) {
    hostValue = [];
    let host = [];
    console.log('reset host');

    $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/host',
        data: layer,
        error: (err) => {
            console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            host = result;
            const num = host.length;
            console.log('result', result);
            $('.host').html(``);
            for (let i = 0; i < num; i++) {
                $('.host').append(
                    `<li>
                      <a href="#" class="dropdown-item">
                        <div class="form-check">
                          <input class="form-check-input host${i}" data-value="${host[i]}" type="checkbox" onclick="hostCheck(${num})">
                            <label class="form-check-label" for="flexCheckDefault">
                              ${host[i]}
                            </label>
                        </div>
                      </a>
                    </li>`
                );
            }
        },
    });
}

function resetContainer() {
    containerValue = [];
    let container = [];
    console.log('reset container');
    $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/container',
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
            const num = container.length;
            $('.button-container').html(``);
            $('.button-container')
                .html(`<button class="btn btn-info dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Container Name
                </button>       
                <ul class="dropdown-menu container">`);
            for (let i = 0; i < num; i++) {
                $('.container').append(
                    `<li>
                <a href="#" class="dropdown-item" id="container-list">
                  <div class="form-check">
                    <input class="form-check-input container${i}" data-value="${container[i]}" name="${container[i]}" type="checkbox" onclick="containerCheck(${num})" id="flexCheckDefault">
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
}

function resetMeasurement(measurement, layer) {
    console.log('reset measurement');
    $('.measurement').html(``);
    const num = measurement.length;
    for (let i = 0; i < num; i++) {
        $('.measurement').append(
            `<li>
              <a href="#" class="dropdown-item" id="measurement-list">
                <div class="form-check">
                  <input class="form-check-input measurement${i}" data-value="${measurement[i]}" name="${measurement[i]}" type="checkbox" onclick="measurementCheck(${num},'${layer}')" id="flexCheckDefault">
                    <label class="form-check-label" for="flexCheckDefault">
                      ${measurement[i]}
                    </label>
                </div>
              </a>
            </li>`
        );
    }
}

function resetField(measurement, layer) {
    console.log('reset field');
    console.log(measurement, layer);
    if (measurement.length === 0) {
        $('.field').html(``);
        return;
    }
    let field;
    if (layer === 'system') {
        field = systemMap[measurement[0]];
    } else if (layer === 'container') {
        field = containerMap[measurement[0]];
    } else {
        return;
    }
    console.log(field);
    $('.field').html(``);
    const num = field.length;
    for (let i = 0; i < field.length; i++) {
        $('.field').append(
            `<li>
              <a href="#" class="dropdown-item" id="measurement-list">
                <div class="form-check"><input class="form-check-input field${i}" data-value="${field[i]}" name="${field[i]}" type="checkbox" onclick="fieldCheck(${num})" id="flexCheckDefault">
                  <label class="form-check-label" for="flexCheckDefault">
                    ${field[i]}
                  </label>
                </div>
              </a>
            </li>`
        );
    }
}

function hostCheck(num) {
    const hostList = [];
    for (let i = 0; i < num; i++) {
        if ($(`.form-check-input.host${i}`).is(':checked')) {
            hostList.push($(`.form-check-input.host${i}`).data('value'));
        }
    }
    console.log(hostList);
    hostValue = hostList;
}

function containerCheck(num) {
    const containerList = [];
    for (let i = 0; i < num; i++) {
        if ($(`.form-check-input.container${i}`).is(':checked')) {
            containerList.push($(`.form-check-input.container${i}`).data('value'));
        }
    }
    console.log(containerList);
    containerValue = containerList;
}

function measurementCheck(num, layer) {
    const measurementList = [];
    for (let i = 0; i < num; i++) {
        if ($(`.form-check-input.measurement${i}`).is(':checked')) {
            measurementList.push($(`.form-check-input.measurement${i}`).data('value'));
        }
    }
    console.log(measurementList);
    measurementValue = measurementList;
    resetField(measurementList, layer);
}

function fieldCheck(num) {
    const fieldList = [];
    for (let i = 0; i < num; i++) {
        if ($(`.form-check-input.field${i}`).is(':checked')) {
            fieldList.push($(`.form-check-input.field${i}`).data('value'));
        }
    }
    fieldValue = fieldList;
    console.log(fieldList);
}

$('#preview').on('click', () => {
    console.log('preview');
    // console.log(hostValue, measurementValue, fieldValue);
    showPreview();
    //get data
});
function showPreview() {
    const setData = {
        layer: $('#layer').val(),
        type: $('#type').val(),
        host: hostValue,
        measurement: measurementValue,
        field: fieldValue,
        timeRange: $('#range').val(),
        timeInterval: $('#interval').val(),
        aggregate: $('#aggregate').val(),
    };
    console.log(setData);
    $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/show',
        data: setData,
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
}
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
        chartId: dashboardData.chartId,
        title: $('.chartTitle').text(),
        layer: $('#layer').val(),
        type: $('#type').val(),
        host: hostValue,
        measurement: measurementValue,
        field: fieldValue,
        timeRange: $('#range').val(),
        interval: $('#interval').val(),
        aggregate: $('#aggregate').val(),
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
