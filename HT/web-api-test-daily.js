import http from "k6/http";
import { check, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

//Daily load testing profile
//Some basic variables

const API_BASE_URL = 'http://weather.student71.local'
const API_GET_ENDPOINT1 = 'WeatherForecast'
const API_GET_ENDPOINT2 = 'Cities/1'
const API_GET_ENDPOINT3 = 'Forecast/1'
const API_HOST = 'weather.student71.local'
const API_POST_ENDPOINT = 'Cities'
const API_POST_ID = 3
const VUS_GET = 50 //
const TARGET_GET = 50 //
const VUS_POST = 150 //
const TARGET_POST = 150 //
const DURATION = '12m' // SLO Load time
const SLO_ERRORS = 'rate<=0.01'
const SLO_REQ_DURATION = 'p(95)<=400'

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
        { target: `${TARGET_GET}`, duration: '1m' },
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
        { target: `${TARGET_POST}`, duration: '1m' },
        { target: `${TARGET_POST}`, duration: `${DURATION}` },
      ],
    },
  },


//SLO Thesholds

  thresholds: {
    http_req_failed: [
      {
        threshold: `${SLO_ERRORS}`,
        abortOnFail: true,
        delayAbortEval: "10s",
      },
    ],
    http_req_duration: [
      {
        threshold: `${SLO_REQ_DURATION}`,
        abortOnFail: true,
        delayAbortEval: "10s",
      },
    ],
  },

};

const params = {
  headers: {
    'HOST': `${API_HOST}`,
    'accept': 'text/plain',
    'Content-Type': 'application/json',
  },
};

export function breakpoint_get() {

  const res = http.batch([
    ['GET', `${API_BASE_URL}/${API_GET_ENDPOINT1}`, null, params],
    ['GET', `${API_BASE_URL}/${API_GET_ENDPOINT2}`, null, params],
    ['GET', `${API_BASE_URL}/${API_GET_ENDPOINT3}`, null, params],
  ]);
  sleep(1);

  check(res[0], {
    'WeatherForecast status was 200': (res) => res.status === 200,
  });

  check(res[1], {
    'Cities status was 200': (res) => res.status === 200,
  });

  check(res[2], {
    'Forecast status was 200': (res) => res.status === 200,
  });

}

export function breakpoint_post() {

//Post data
  const data = { id: `${API_POST_ID}`, name: randomItem(Cities) };
  const put = http.put(`${API_BASE_URL}/${API_POST_ENDPOINT}/${API_POST_ID}`, JSON.stringify(data), params);
  sleep(1);
  check(put, {
    "PUT status is 200": (p) => p.status === 200
  });

}
