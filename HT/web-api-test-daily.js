import http from "k6/http";
import { check, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

//Some basic variables

const API_BASE_URL = 'http://91.185.85.213'
const API_GET_ENDPOINT1 = 'WeatherForecast'
const API_GET_ENDPOINT2 = 'Cities/1'
const API_GET_ENDPOINT3 = 'Forecast/1'
const API_HOST = 'weather.student71.local'
const API_POST_ENDPOINT = 'Cities'
const API_POST_ID = 3
const TARGET_GET = 365 //
const TARGET_GET2 = 650 //
const TARGET_POST = 25 //
const DURATION = '5m' // SLO Load time
const DURATION_POST = '20m' // SLO Load time
const SLO_ERRORS = 'rate<=0.01'
const SLO_REQ_DURATION = 'p(95)<=500'

let Cities = Array('Казань', 'Тверь', 'Белгород', 'Рязань', 'Таганрог', 'Новочеркасск');

//options
export const options = {
scenarios: {
    get: {
      executor: 'ramping-vus',
      exec: 'breakpoint_get',
      startTime: '5s',
      gracefulStop: '5s',

      startVUs: 1,
      gracefulRampDown: '10s',
      stages: [
        { target: `${TARGET_GET}`, duration: '2m' },
        { target: `${TARGET_GET}`, duration: `${DURATION}` },
        { target: `${TARGET_GET2}`, duration: `1m` },
        { target: `${TARGET_GET}`, duration: `1m` },
        { target: `${TARGET_GET}`, duration: `${DURATION}` },
        { target: `${TARGET_GET2}`, duration: `1m` },
        { target: `${TARGET_GET}`, duration: `1m` },
        { target: `${TARGET_GET}`, duration: `${DURATION}` },
      ],
    },
    post: {
      executor: 'ramping-vus',
      exec: 'breakpoint_post',
      startTime: '5s',
      gracefulStop: '5s',

      startVUs: 1,
      gracefulRampDown: '10s',
      stages: [
        { target: `${TARGET_POST}`, duration: '1m' },
        { target: `${TARGET_POST}`, duration: `${DURATION_POST}` },
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
  ]);
  sleep(1);

  check(res[0], {
    'WeatherForecast status was 200': (res) => res.status === 200,
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
