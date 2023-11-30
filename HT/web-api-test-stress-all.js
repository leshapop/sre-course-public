import http from "k6/http";
import { check, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

//Basic variables

const API_BASE_URL = 'http://91.185.85.213'
const API_GET_ENDPOINT1 = 'WeatherForecast'
const API_GET_ENDPOINT2 = 'Cities/1'
const API_HOST = 'weather.student71.local'
const API_POST_ENDPOINT = 'Cities'
const API_POST_ID = 3
const VUS_GET = 2
const TARGET_GET = 2
const VUS_POST = 2
const TARGET_POST = 2
const DURATION = '1s' // SLO Load time
const DURATION_POST = '1s' // SLO Load time
const SLO_ERRORS = 'rate<=0.01'
const SLO_REQ_DURATION = 'p(95)<=500'
const SLO_ERRORS_ABORT = true
const SLO_REQ_DURATION_ABORT = true

//Fake data for POST REQ
let Cities = Array('Казань', 'Тверь', 'Белгород', 'Рязань', 'Таганрог', 'Новочеркасск');

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

        { target: `${TARGET_GET}`, duration: `2m` },
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
        { target: `${TARGET_POST}`, duration: `2m` },
        { target: `${TARGET_POST}`, duration: `${DURATION_POST}` },
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
//Cities endpoints requests
export function stress_cities() {

  const res = http.get(`${API_BASE_URL}/Cities/`, params);
  console.log(res.json());
  sleep(1);
  check(res, {
    "GET status is 200": (r) => r.status === 200
  });
  const res = http.get(`${API_BASE_URL}/Cities/`, params);
  sleep(1);
  check(res, {
    "GET status is 200": (r) => r.status === 200
  });


}
//Forecast endpoints requests
export function stress_forecast() {

//Post data
  const data = { id: `${API_POST_ID}`, name: randomItem(Cities) };
  const put = http.put(`${API_BASE_URL}/${API_POST_ENDPOINT}/${API_POST_ID}`, JSON.stringify(data), params);
  sleep(1);
  check(put, {
    "PUT status is 200": (p) => p.status === 200
  });


}
