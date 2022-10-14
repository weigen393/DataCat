const dashboardData = data;
const systemMap = {
    cpu: ['usage_system'],
    // disk: ['used', 'used_percent'],
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
const applicationMap = {
    method: [],
    url: [],
    statusCode: [],
    requestCount: ['total'],
    customize: [],
};
let layerValue;
let hostValue = [];
let containerValue = [];
let measurementValue = [];
let fieldValue = [];
let infoValue = [];
const maxText = 30;
if (dashboardData.chartId !== undefined) {
    console.log('it is not new');
    setChart(dashboardData.dashboardId, dashboardData.chartId);
}
async function setChart(dashboardId, chartId) {
    const sendData = {
        chartId: chartId,
    };
    console.log(sendData);
    let setData;
    await $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/edit',
        data: sendData,
        error: (err) => {
            console.log(err);
        },
        success: async (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
            setData = result;
            console.log(result[0].host);
            const layer = setData[0].layer;
            const measurement = setData[0].measurement;
            await resetHost(layer);
            measurementValue = setData[0].measurement;
            fieldValue = setData[0].field;
            infoValue = setData[0].info;
            hostValue = setData[0].host;
            if (layer === 'system') {
                $('.button-container').html(``);
                await resetMeasurement(Object.keys(systemMap), layer);
            } else if (layer === 'container') {
                $('.field').html(``);
                await resetContainer(setData[0].host);
                await resetMeasurement(Object.keys(containerMap), layer);
            } else if (layer === 'application') {
                $('.button-container').html(``);
                await resetMeasurement(Object.keys(applicationMap), layer);
                await resetInfo();
            }
            $('.chart-title').text(setData[0].title);
            $(`select option[value=${layer}]`).attr('selected', true);
            $(`select option[value=${setData[0].type}]`).attr('selected', true);
            $(`select option[value=${setData[0].timeRange}]`).attr('selected', true);
            $(`select option[value=${setData[0].interval}]`).attr('selected', true);
            $(`select option[value=${setData[0].aggregate}]`).attr('selected', true);
            await resetField(measurement, layer).then(async () => {
                console.log(setData[0].host[0]);
                $(`input[data-value="${setData[0].host[0]}"]`).attr('checked', true);
                $(`input[data-value="${setData[0].field[0]}"]`).attr('checked', true);
                $(`input[data-value="${setData[0].measurement[0]}"]`).attr('checked', true);
                $(`input[data-value="${setData[0].info[0]}"]`).attr('checked', true);
                if (setData[0].container !== undefined) {
                    containerValue = setData[0].container;
                    $(`input[data-value="${setData[0].container[0]}"]`).attr('checked', true);
                }
                await showPreview();
            });
        },
    });
}
$('#layer').on('change', async () => {
    const layer = $('#layer').val();
    layerValue = layer;
    await resetHost(layer);
    $('.select-host').text('');
    $('.select-container').text('');
    $('.select-measurement').text('');
    $('.select-field').text('');
    $('.select-info').text('');
    if (layer === 'system') {
        $('.button-container').html(``);
        $('.field').html(``);
        $('.button-info').html('');
        await resetMeasurement(Object.keys(systemMap), layer);
    } else if (layer === 'container') {
        $('.field').html(``);
        $('.button-info').html('');
        await resetMeasurement(Object.keys(containerMap), layer);
    } else if (layer === 'application') {
        $('.button-container').html(``);
        $('.field').html(``);
        // resetMeasurement(Object.keys(applicationMap), layer);
        // resetInfo();
    }
});
async function resetHost(layer) {
    hostValue = [];
    let host = [];
    Swal.fire({
        title: 'Loading ...',
        width: 600,
        padding: '1.5em 3em 3em 3em',
        color: '#716add',
        backdrop: `
          rgba(0,0,123,0.4)
          url("/images/nyan-cat-nyan.gif")
          left top
          no-repeat
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
    });
    await $.ajax({
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
            console.log('reset host');
            Swal.fire({
                title: 'Loading ...',
                timer: 10,
                showCancelButton: false,
                showConfirmButton: false,
            });
        },
    });
}
async function hostCheck(num) {
    const hostList = [];
    for (let i = 0; i < num; i++) {
        if ($(`.form-check-input.host${i}`).is(':checked')) {
            hostList.push($(`.form-check-input.host${i}`).data('value'));
        }
    }
    console.log(hostList);
    hostValue = hostList;
    const hostHint = hostList.map((item) => item.split('.')[0]);

    if (layerValue === 'container') {
        await resetContainer(hostList);
        $('.select-host').text(`host: ${hostHint}`);
    } else if (layerValue === 'application') {
        $('.field').html(``);
        $('.select-host').text(`host: ${hostList}`);
        await resetMeasurement(Object.keys(applicationMap), layerValue);
    } else {
        $('.select-host').text(`host: ${hostHint}`);
    }
}
async function resetContainer(host) {
    containerValue = [];
    let container = [];
    console.log('reset container');
    Swal.fire({
        title: 'Loading ...',
        width: 600,
        padding: '3em',
        color: '#716add',
        backdrop: `
          rgba(0,0,123,0.4)
          url("/images/nyan-cat-nyan.gif")
          left top
          no-repeat
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
    });
    await $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/container',
        data: { host: host[0] },
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
            Swal.fire({
                title: 'Loading ...',
                timer: 10,
                showCancelButton: false,
                showConfirmButton: false,
            });
        },
    });
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
    $('.select-container').show();
    $('.select-container').text(`container: ${containerList}`);
}

async function resetMeasurement(measurement, layer) {
    $('.measurement').html(``);
    console.log(measurement);
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
    console.log('reset measurement');
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
    $('.select-measurement').text(`measurement: ${measurementList}`);
    resetField(measurementList, layer);
    if (layer === 'application') {
        resetInfo();
    }
}
async function resetField(measurement, layer) {
    let field;
    let setData = { measurement: measurement[0], host: hostValue[0] };
    if (layer === 'system') {
        field = systemMap[measurement[0]];
    } else if (layer === 'container') {
        field = containerMap[measurement[0]];
    } else if (layer === 'application') {
        if (measurement[0] === 'requestCount') {
            field = ['total'];
        } else {
            await $.ajax({
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                },
                url: '/api/1.0/chart/appField',
                data: setData,
                error: (err) => {
                    console.log(err);
                },
                success: (result) => {
                    if (result.status === 200) {
                        console.log('success');
                    }
                    console.log('result', result);
                    field = result;
                    // if ($('#type').val() === 'line') {
                    //     showLineChart(result);
                    // } else if ($('#type').val() === 'number') {
                    //     showNumber(result);
                    // }
                },
            });
        }
    }
    console.log(field);
    $('.field').html(``);
    const num = field?.length;
    for (let i = 0; i < num; i++) {
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
    console.log('reset field');
}
function resetInfo() {
    let info;
    if (measurementValue[0] === 'requestCount') {
        info = ['countSum'];
    } else if (measurementValue[0] === 'customize') {
        info = ['value'];
    } else {
        info = ['duration', 'count', 'countSum'];
    }
    const num = info.length;
    $('.button-info').html('');
    $('.button-info')
        .html(`<button class="btn btn-info dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Info
                </button>       
                <ul class="dropdown-menu info">`);
    let check = '';
    if (num === 1) {
        check = 'checked';
    }
    for (let i = 0; i < num; i++) {
        $('.dropdown-menu.info').append(
            `<li>
                <a href="#" class="dropdown-item" id="info-list">
                <div class="form-check">
                    <input class="form-check-input info${i}" data-value="${info[i]}" name="${info[i]}" type="checkbox" onclick="infoCheck(${num})" id="flexCheckDefault" ${check}>
                    <label class="form-check-label" for="flexCheckDefault">
                        ${info[i]}
                    </label>
                </div>
                </a>
            </li>`
        );
    }
}
function infoCheck(num) {
    const infoList = [];
    for (let i = 0; i < num; i++) {
        if ($(`.form-check-input.info${i}`).is(':checked')) {
            infoList.push($(`.form-check-input.info${i}`).data('value'));
        }
    }
    infoValue = infoList;
    console.log(infoList);
    $('.select-info').show();
    $('.select-info').text(`info: ${infoList}`);
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
    $('.select-field').text(`field: ${fieldList}`);
}

$('#preview').on('click', async () => {
    console.log('preview');
    const check = await checkSelect();
    if (check) {
        showPreview();
    }
});
async function showPreview() {
    const setData = {
        layer: $('#layer').val(),
        type: $('#type').val(),
        host: hostValue,
        container: containerValue,
        measurement: measurementValue,
        field: fieldValue,
        info: infoValue,
        timeRange: $('#range').val(),
        timeInterval: $('#interval').val(),
        aggregate: $('#aggregate').val(),
    };
    Swal.fire({
        title: 'Loading ...',
        width: 600,
        padding: '1.5em 3em 3em 3em',
        color: '#716add',
        backdrop: `
          rgba(0,0,123,0.4)
          url("/images/nyan-cat-nyan.gif")
          left top
          no-repeat
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
    });
    console.log(setData);
    await $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/show',
        data: setData,
        error: (err) => {
            console.log(err);
        },
        success: async (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
            if ($('#type').val() === 'line') {
                $('.card-number').html('');
                $('.card-number').css('height', '0px');
                $('.card-body').css('height', '500px');
                await showLineChart(result);
            } else if ($('#type').val() === 'number') {
                $('.card-body').html('');
                $('.card-body').css('height', '0px');
                $('.card-number').css('height', '400px');
                await showNumber(result);
            }
            Swal.fire({
                title: 'Loading ...',
                timer: 10,
                showCancelButton: false,
                showConfirmButton: false,
            });
        },
    });
}
async function showLineChart(data) {
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
    $.plot('#line-chart', [line_data1], {
        grid: {
            hoverable: true,
            borderColor: '#f3f3f3',
            borderWidth: 1,
            tickColor: '#f3f3f3',
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
        lines: {
            fill: false,

            // color: ['#ffffff'], //#3c8dbc
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
                // .html(item.series.label + ' of ' + x + ' = ' + y)
                .html(y)
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
async function showNumber(data) {
    const lastNum = data.pop();
    console.log(lastNum._value);
    $('.card-number').text(lastNum._value.toFixed(2)).attr('class', 'card-number');
}
$('#save').on('click', async () => {
    console.log('save');
    $('#save').prop('disabled', true);
    const check = await checkSelect();
    const title = $('.chart-title').text();
    if (title.length > maxText) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Chart title is too long!`,
        }).then(() => {
            $('.chart-title').focus();
        });
    } else if (title.includes('<') || title.includes('>')) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Chart title includes invalid symbol!`,
        }).then(() => {
            $('.chart-title').focus();
        });
    } else if (check) {
        saveChart();
    }
});
async function saveChart() {
    const data = {
        dashboardId: dashboardData.dashboardId,
        chartId: dashboardData.chartId,
        title: $('.chart-title').text(),
        layer: $('#layer').val(),
        type: $('#type').val(),
        host: hostValue,
        container: containerValue,
        measurement: measurementValue,
        field: fieldValue,
        info: infoValue,
        timeRange: $('#range').val(),
        interval: $('#interval').val(),
        aggregate: $('#aggregate').val(),
    };
    console.log(data);
    await $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/chart/save',
        data: JSON.stringify(data),
        error: (err) => {
            console.log(err);
        },
        success: async (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
            await Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Your work has been saved',
                showConfirmButton: false,
                timer: 1500,
            });
            window.location.href = `/dashboards/${dashboardData.dashboardId}`;
        },
    });
}
async function checkSelect() {
    let selectData = [
        $('#layer').val(),
        $('#type').val(),
        $('#range').val(),
        $('#interval').val(),
        $('#aggregate').val(),
    ];
    let dropdownData = [];
    if ($('#layer').val() === 'system') {
        dropdownData = [hostValue, measurementValue, fieldValue];
    } else if ($('#layer').val() === 'container') {
        dropdownData = [hostValue, containerValue, measurementValue, fieldValue];
    } else if ($('#layer').val() === 'application') {
        dropdownData = [hostValue, measurementValue, fieldValue, infoValue];
    }
    const checkDrop = dropdownData.map((item) => item.length);
    console.log('check', checkDrop);
    if (selectData.includes('0')) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something else should be selected!',
        });
        return 0;
    } else if (checkDrop.includes(0)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something else should be selected!',
        });
        return 0;
    } else {
        return 1;
    }
}
$('.sidebar-dashboard').css('background-color', 'rgba(255, 255, 255, 0.1)');
$('.sidebar-dashboard').css('color', '#fff');

$('.edit-title-btn').on('click', () => {
    console.log('edit');
    $('.chart-title').css('display', 'none');
    $('.title-input').css('display', 'block');
    $('.title-input').attr('value', $('.chart-title').text());
    $('.edit-title-btn').css('visibility', 'hidden');
    $('.title-input').trigger('focus');
    $('.title-input').on('blur', async () => {
        console.log('change');
        const checkTitle = await checkText($('.title-input').val(), '.title-input');
        if (checkTitle) {
            $('.title-input').css('display', 'none');
            $('.chart-title').css('display', 'block');

            $('.edit-title-btn').css('visibility', 'visible');
            $('.chart-title').text($('.title-input').val());
        }
    });
});
async function checkText(text, element) {
    console.log(text);
    if (text.length > maxText) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Chart title is too long!`,
        }).then(() => {
            $(`.chart-title`).css('display', 'none');
            $(element).css('display', 'block');
            $(element).trigger('focus');
            console.log('hello');
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
