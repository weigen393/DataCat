// k6 run script.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    discardResponseBodies: true,
    scenarios: {
        contacts: {
            executor: 'constant-arrival-rate',
            rate: 1000,
            timeUnit: '1s',
            duration: '10s',
            preAllocatedVUs: 500,
            //   maxVUs: 10000,
        },
    },
};

// test HTTP
export default function () {
    // let test_url = `https://weigen.online/api/1.0/user/signin}`;
    let test_url = `https://weigen.online/index.html}`;
    const res = http.get(test_url);
    check(res, { 'status was 200': (r) => r.status == 200 });
    sleep(1);
}
