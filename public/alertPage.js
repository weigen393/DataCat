const alertData = data;
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
let thresholdValue;
const maxText = 30;
const maxTitleText = 30;
if (alertData.alertId !== undefined) {
    console.log('it is not new');
    resetAlert(alertData.alertId);
}
async function resetAlert(alertId) {
    const sendData = {
        alertId: alertId,
    };
    console.log(sendData);
    let setData;
    await $.ajax({
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/alerts/edit',
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
            console.log(result.host);
            const layer = setData.layer;
            const measurement = setData.measurement;
            await resetHost(layer);
            measurementValue = setData.measurement;
            fieldValue = setData.field;
            infoValue = setData.info;
            hostValue = setData.host;
            thresholdValue = setData.threshold;
            if (layer === 'system') {
                $('.button-container').html(``);
                await resetMeasurement(Object.keys(systemMap), layer);
            } else if (layer === 'container') {
                $('.field').html(``);
                await resetContainer(setData.host);
                await resetMeasurement(Object.keys(containerMap), layer);
            } else if (layer === 'application') {
                $('.button-container').html(``);
                await resetMeasurement(Object.keys(applicationMap), layer);
                resetInfo();
            }

            $('.alert-title').text(setData.title);
            $('.alert-description').text(setData.description);
            $(`select option[value=${layer}]`).attr('selected', true);
            // $(`select option[value=${setData.type}]`).attr('selected', true);
            $(`select option[value=${setData.timeRange}]`).attr('selected', true);
            $(`select option[value=${setData.interval}]`).attr('selected', true);
            $(`select option[value=${setData.aggregate}]`).attr('selected', true);
            $(`select option[value=${setData.schedule}]`).attr('selected', true);
            $(`select option[value=${setData.checkType}]`).attr('selected', true);
            await resetField(measurement, layer).then(async () => {
                if (setData.container !== undefined) {
                    containerValue = setData.container;
                    $(`input[data-value="${setData.container[0]}"]`).attr('checked', true);
                }
                $(`input[data-value="${setData.host[0]}"]`).attr('checked', true);
                $(`input[data-value="${setData.field[0]}"]`).attr('checked', true);
                $(`input[data-value="${setData.measurement[0]}"]`).attr('checked', true);
                $(`input[data-value="${setData.info[0]}"]`).attr('checked', true);
                if (setData.checkType === 'alive') {
                    $('.check-text').html(`<p class='text'>When not reporting for</p>
                                <input id='deadTime'>s
                    `);
                    $('#deadTime').attr('value', setData.deadTime);
                }
                if (setData.checkType === 'threshold') {
                    $('.check-text').html(`<p class='text'>When value is</p>
                                <select class="form-select form-select-sm" id='thresholdType'>
                                  <option value='above' selected>above</option>
                                  <option value='below'>below</option>
                                </select>
                                <input id='threshold' placeholder='value'>`);
                    $(`select option[value=${setData.thresholdType}]`).attr('selected', true);
                    $('#threshold').on('input', async () => {
                        console.log('threshold change');
                        thresholdValue = $('#threshold').val();
                        await showPreview();
                    });
                    $('#threshold').attr('value', setData.threshold);
                }

                console.log(setData.host[0]);
                await showPreview();
            });
        },
    });
}
$('#layer').on('change', async () => {
    const layer = $('#layer').val();
    layerValue = layer;
    await resetHost(layer);
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

function resetMeasurement(measurement, layer) {
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
        info = ['duration', 'count'];
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
        type: 'line',
        host: hostValue,
        container: containerValue,
        measurement: measurementValue,
        field: fieldValue,
        info: infoValue,
        timeRange: $('#range').val(),
        timeInterval: $('#interval').val(),
        aggregate: $('#aggregate').val(),
    };
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
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);

            // $('.card-number').html('');
            // $('.card-number').css('height', '0px');
            // $('.card-body').css('height', '500px');
            showLineChart(result);
        },
    });
}
function showLineChart(data) {
    const value = [];
    const time = [];
    const threshold = [];
    // let thresholdValue = 75;
    for (let i = 0; i < data.length; i++) {
        value.push([Date.parse(data[i]._time), data[i]._value]);
        time.push(data[i]._time);
        threshold.push([Date.parse(data[i]._time), thresholdValue]);
    }
    var line_data1 = {
        data: value,
        color: '#356fe2',
    };
    var line_data2 = {
        data: threshold,
        color: '#FF0000',
    };
    $.plot('#line-chart', [line_data1, line_data2], {
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

$('#check').on('change', () => {
    const checkType = $('#check').val();
    if (checkType === 'threshold') {
        $('.check-text').html(`<p class='text'>When value is</p>
                    <select class="form-select form-select-sm" id='thresholdType'>
                      <option value='above' selected>above</option>
                      <option value='below'>below</option>        
                    </select>
                    <input id='threshold' placeholder='value'>`);
        $('#threshold').on('input', () => {
            console.log('threshold change');
            thresholdValue = $('#threshold').val();
            showPreview();
        });
    } else if (checkType === 'alive') {
        $('.check-text').html(`<p class='text'>When not reporting for</p>
                                <input id='deadTime'>s
        `);
    }
});

$('#save').on('click', async () => {
    $('#save').prop('disabled', true);
    const check = await checkSelect('save');
    const title = $('.alert-title').text();
    const description = $('.alert-description').text();
    if (title.length > maxText) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Alert title is too long!`,
        }).then(() => {
            $('.alert-title').focus();
        });
        // } else if (title.includes('<') || title.includes('>')) {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Oops...',
        //         text: `Alert title includes invalid symbol!`,
        //     }).then(() => {
        //         $('.alert-title').focus();
        //     });
    } else if (description.length > maxText) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Alert description is too long!`,
        }).then(() => {
            $('.alert-description').focus();
        });
        // } else if (description.includes('<') || description.includes('>')) {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Oops...',
        //         text: `Alert description includes invalid symbol!`,
        //     }).then(() => {
        //         $('.alert-description').focus();
        //     });
    } else if (check) {
        saveAlert();
    }
});
async function saveAlert() {
    const data = {
        alertId: alertData.alertId,
        title: $('.alert-title').text(),
        description: $('.alert-description').text(),
        layer: $('#layer').val(),
        host: hostValue,
        container: containerValue,
        measurement: measurementValue,
        field: fieldValue,
        info: infoValue,
        timeRange: $('#range').val(),
        interval: $('#interval').val(),
        aggregate: $('#aggregate').val(),
        schedule: $('#schedule').val(),
        checkType: $('#check').val(),
        thresholdType: $('#thresholdType').val(),
        threshold: $('#threshold').val(),
        deadTime: $('#deadTime').val(),
    };
    console.log(data);
    await $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/alerts/save',
        data: JSON.stringify(data),
        error: (err) => {
            console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
            const sendData = {
                alertId: result.alertId,
                schedule: result.schedule,
            };
            setAlert(sendData);
            window.location.href = `/alert-list`;
        },
    });
}
async function checkSelect(type) {
    let selectData = [$('#layer').val(), $('#range').val(), $('#interval').val(), $('#aggregate').val()];
    if (type === 'save') {
        selectData = [
            $('#layer').val(),
            $('#range').val(),
            $('#interval').val(),
            $('#aggregate').val(),
            $('#schedule').val(),
            $('#check').val(),
        ];
    }
    if ($('#check').val() === 'threshold') {
        selectData.push($('#thresholdType').val());
        if (!validator.isNumeric($('#threshold').val())) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Threshold value should be number!',
            });
            return 0;
        }
    } else if ($('#check').val() === 'alive') {
        if (!validator.isNumeric($('#deadTime').val())) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Dead time value should be number!',
            });
            return 0;
        }
        if (+$('#deadTime').val() < 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Dead time value should a positive number!',
            });
            return 0;
        }
    }
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
async function setAlert(sendData) {
    console.log(sendData);
    await $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: '/api/1.0/alerts/set',
        data: JSON.stringify(sendData),
        error: (err) => {
            console.log(err);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            console.log('result', result);
        },
    });
}
// $('#threshold').on('input', () => {
//     console.log('threshold change');
// });
async function alertLine(value) {
    showPreview();
}
$('.sidebar-alert').css('background-color', 'rgba(255, 255, 255, 0.1)');
$('.sidebar-alert').css('color', '#fff');

$('.edit-title-btn').on('click', () => {
    console.log('edit');
    $('.alert-title').css('display', 'none');
    $('.title-input').css('display', 'block');
    $('.title-input').attr('value', $('.alert-title').text());
    $('.edit-title-btn').css('visibility', 'hidden');
    $('.title-input').trigger('focus');
    $('.title-input').on('blur', async () => {
        console.log('change');
        $('.title-input').css('display', 'none');
        $('.alert-title').css('display', 'block');
        const text = {
            title: $('.title-input').val(),
            description: $('.alert-description').text(),
        };
        console.log('text', text);
        const checkTitle = await checkText(text.title, '.title-input', 'title');
        if (checkTitle) {
            $('.edit-title-btn').css('visibility', 'visible');
            $('.alert-title').text($('.title-input').val());
        }
    });
});
$('.edit-description-btn').on('click', () => {
    console.log('edit');
    $('.alert-description').css('display', 'none');
    $('.description-input').css('display', 'block');
    $('.description-input').attr('value', $('.alert-description').text());
    $('.edit-description-btn').css('visibility', 'hidden');
    $('.description-input').trigger('focus');
    $('.description-input').on('blur', async () => {
        console.log('change');
        $('.description-input').css('display', 'none');
        $('.alert-description').css('display', 'block');
        const text = {
            title: $('.alert-title').text(),
            description: $('.description-input').val(),
        };
        console.log('text', text);
        const checkTitle = await checkText(text.description, '.description-input', 'description');
        if (checkTitle) {
            $('.edit-description-btn').css('visibility', 'visible');
            $('.alert-description').text($('.description-input').val());
        }
    });
});

async function checkText(text, element, name) {
    console.log(text);
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
            $(`.alert-${name}`).css('display', 'none');
            $(element).css('display', 'block');
            $(element).trigger('focus');
            console.log('hello');
        });
        return 0;
        // } else if (text.includes('<') || text.includes('>')) {
        // Swal.fire({
        //     icon: 'error',
        //     title: 'Oops...',
        //     text: `Dashboard ${name} includes invalid symbol!`,
        // }).then(() => {
        //     $(element).focus();
        // });
        // return 1;
    } else {
        return 1;
    }
}
