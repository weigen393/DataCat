// k6 run script.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    discardResponseBodies: true,
    scenarios: {
        contacts: {
            executor: 'constant-arrival-rate',
            rate: 1500,
            timeUnit: '1s',
            duration: '30s',
            preAllocatedVUs: 1000,
            //   maxVUs: 10000,
        },
    },
};

// test HTTP
export default function () {
    let test_url = `https://weigen.online/api/1.0/user/signin`;
    // let test_url = `https://weigen.online/api/1.0/products/all`;
    // let test_url = `https://weigen.online/index.html}`;
    const res = http.post(
        test_url,
        JSON.stringify({
            provider: 'native',
            email: 'xxxxxx@xxx.com',
            password: 'xxxx',
        }),
        {
            headers: { 'Content-Type': 'application/json' },
        }
    );
    check(res, { 'status was 200': (r) => r.status == 200 });
    sleep(1);
}
