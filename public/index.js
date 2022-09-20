$('.sign-up').on('click', () => {
    $('.sign-up-box').css('display', 'flex');
    $('.sign-in-box').css('display', 'none');
    $('.signUp').css('display', 'flex');
    $('.signIn').css('display', 'none');
});
$('.sign-in').on('click', () => {
    $('.sign-in-box').css('display', 'flex');
    $('.sign-up-box').css('display', 'none');
    $('.signIn').css('display', 'flex');
    $('.signUp').css('display', 'none');
});

$('.signBtn').on('click', async () => {
    console.log('sign up');
    const data = {
        name: $('.signUpName').val(),
        email: $('.signUpEmail').val(),
        password: $('.signUpPwd').val(),
    };
    console.log(data);
    await $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: `/api/1.0/user/signup`,
        data: JSON.stringify(data),
        error: (err) => {
            console.log(err);
            console.log(err.responseText);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            window.location.href = `/api/1.0/dashboard-list`;
        },
    });
});
$('.signIn').on('click', async () => {
    console.log('sign in');
    const data = {
        email: $('.signInEmail').val(),
        password: $('.signInPwd').val(),
    };
    console.log(data);
    await $.ajax({
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        url: `/api/1.0/user/signin`,
        data: JSON.stringify(data),
        error: (err) => {
            console.log(err);
            console.log(err.responseText);
        },
        success: (result) => {
            if (result.status === 200) {
                console.log('success');
            }
            window.location.href = `/api/1.0/dashboard-list`;
        },
    });
});

// import * as datGui from 'https://cdn.skypack.dev/dat.gui@0.7.7';

const state = {
    fps: 20,
    color: '#00d6ff',
    charset: '0123456789ABCDEF',
};

// const gui = new datGui.GUI();
// const fpsCtrl = gui.add(state, 'fps').min(1).max(120).step(1);
// gui.addColor(state, 'color');
// gui.add(state, 'charset');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let w, h, p;
const resize = () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;

    p = Array(Math.ceil(w / 10)).fill(0);
};
window.addEventListener('resize', resize);
resize();

const random = (items) => items[Math.floor(Math.random() * items.length)];

const draw = () => {
    ctx.fillStyle = 'rgba(0,0,0,.05)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = state.color;

    for (let i = 0; i < p.length; i++) {
        let v = p[i];
        ctx.fillText(random(state.charset), i * 10, v);
        p[i] = v >= h || v >= 10000 * Math.random() ? 0 : v + 10;
    }
};

let interval = setInterval(draw, 1000 / state.fps);
// fpsCtrl.onFinishChange((fps) => {
//     console.log(fps);
//     if (interval) {
//         clearInterval(interval);
//     }
//     interval = setInterval(draw, 1000 / fps);
// });
