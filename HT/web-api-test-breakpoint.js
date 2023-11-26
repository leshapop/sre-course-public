import http from "k6/http";
import { check, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

//Find breakpoint HT profile
//Basic variables

const API_BASE_URL = 'http://weather.student71.local'
const API_GET_ENDPOINT1 = 'WeatherForecast'
const API_GET_ENDPOINT2 = 'Cities/1'
const API_HOST = 'weather.student71.local'
const API_POST_ENDPOINT = 'Cities'
const API_POST_ID = 3
const VUS_GET = 2000 //Find breakpoint
const TARGET_GET = 2000 //Find breakpoint
const VUS_POST = 0 //Find breakpoint
const TARGET_POST = 0 //Find breakpoint
const DURATION = '15m' // SLO Load time
const SLO_ERRORS = 'rate<=0.01'
const SLO_REQ_DURATION = 'p(95)<=400'
const SLO_ERRORS_ABORT = true
const SLO_REQ_DURATION_ABORT = false

//Fake data for POST REQ
let Cities = Array('Kazan', 'Tver', 'Belgorod', 'Ryazan', 'Taganrog', 'Novocherkassk');

//options
export const options = {
  scenarios: {
    get: {
      executor: 'ramping-arrival-rate',
      exec: 'breakpoint_get',
      startTime: '5s',
      gracefulStop: '5s',

      StartRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: `${VUS_GET}`,
      stages: [
        { target: `${TARGET_GET}`, duration: `${DURATION}` },
      ],
    },
    post: {
      executor: 'ramping-arrival-rate',
      exec: 'breakpoint_post',
      startTime: '5s',
      gracefulStop: '5s',

      StartRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: `${VUS_POST}`,
      stages: [
        { target: `${TARGET_POST}`, duration: `${DURATION}` },
      ],
    },
  },

//SLO Thesholds

  thresholds: {
    http_req_failed: [
      {
        threshold: `${SLO_ERRORS}`,
        abortOnFail: SLO_ERRORS_ABORT,
        delayAbortEval: '10s',
      },
    ],
    http_req_duration: [
      {
        threshold: `${SLO_REQ_DURATION}`,
        abortOnFail: SLO_REQ_DURATION_ABORT,
        delayAbortEval: '10s',
      },
    ],
  },

};

//Headers
const params = {
  headers: {
    'HOST': `${API_HOST}`,
    'accept': 'text/plain',
    'Content-Type': 'application/json',
  },
};
//Get requests
export function breakpoint_get() {

  const res = http.get(`${API_BASE_URL}/${API_GET_ENDPOINT2}`, params);
  sleep(1);
  check(res, {
    "GET status is 200": (r) => r.status === 200
  });


}
//Post requests
export function breakpoint_post() {

//Post data
  const data = { id: `${API_POST_ID}`, name: randomItem(Cities) };
  const put = http.put(`${API_BASE_URL}/${API_POST_ENDPOINT}/${API_POST_ID}`, JSON.stringify(data), params);
  sleep(1);
  check(put, {
    "PUT status is 200": (p) => p.status === 200
  });


}
