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

$('.signUp').on('click', async () => {
    console.log('sign up');
    const data = {
        name: $('.signUpName').val(),
        email: $('.signUpEmail').val(),
        password: $('.signUpPwd').val(),
    };
    const check = await validation(data);

    if (check) {
        console.log(data);
        await $.ajax({
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            url: `/api/1.0/user/signup`,
            data: JSON.stringify(data),
            error: (err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: err.responseText,
                });
            },
            success: (result) => {
                if (result.status === 200) {
                    console.log('success');
                }
                window.location.href = `/dashboard-list`;
            },
        });
    }
});
$('.signIn').on('click', async () => {
    console.log('sign in');
    const data = {
        email: $('.signInEmail').val(),
        password: $('.signInPwd').val(),
    };
    const check = await validation(data);
    if (check) {
        console.log(data);
        await $.ajax({
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            url: `/api/1.0/user/signin`,
            data: JSON.stringify(data),
            error: (err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: err.responseText,
                });
            },
            success: (result) => {
                if (result.status === 200) {
                    console.log('success');
                }
                window.location.href = `/dashboard-list`;
            },
        });
    }
});
async function validation(data) {
    if (data?.name !== undefined) {
        if (!data.name) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `Input cannot be empty!`,
            });
            return 0;
        }
        if (!validator.isByteLength(data.name, 0, 20)) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `The name is too long!`,
            });
            return 0;
        }
    }
    if (!data.email || !data.password) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Input cannot be empty!`,
        });
        return 0;
    }
    if (!validator.isEmail(data.email)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Invalid email format!`,
        });
        return 0;
    }

    if (!validator.isByteLength(data.password, 6, 16)) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Invalid password length!`,
            footer: `(between 6~16 characters)`,
        });
        return 0;
    }
    if (
        !validator.isStrongPassword(data.password, {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
        })
    ) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Invalid password format!`,
            footer: `(at least a number, an uppercase, and a lowercase is needed, and between 6~16 characters)`,
        });
        return 0;
    }
    return 1;
}
// import * as datGui from 'https://cdn.skypack.dev/dat.gui@0.7.7';

const state = {
    fps: 20,
    color: '#00d6ff',
    charset: '000001111123456789ABCDEF',
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
        ctx.font = '20px  Arial';
        ctx.fillText(random(state.charset), i * 20, v);
        p[i] = v >= h || v >= 20000 * Math.random() ? 0 : v + 20;
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
