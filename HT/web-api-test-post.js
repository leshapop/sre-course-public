import http from "k6/http";
import { check, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

//Some basic variables

const API_BASE_URL = 'http://weather.student71.local'
const API_GET_ENDPOINT = 'WeatherForecast'
const API_HOST = 'weather.student71.local'
const API_POST_ENDPOINT = 'Cities'
const API_POST_ID = 3
const VUS = 1
const TARGET = 300 //50% of MAX (TARGET = 50%MAX / (VUS * GET_POST_REQ)) There are 1 GET and 1 PUT requests.
const DURATION = 7 // SLO Load time

let Cities = Array('Kazan', 'Tver', 'Belgorod', 'Ryazan', 'Taganrog', 'Novocherkassk');

//options
export const options = {
  scenarios: {
    ramp: {
      executor: 'ramping-vus',

      startTime: '5s',
      gracefulStop: '5s',

      startVUs: 1,

      stages: [
        { duration: '1m', target: `${TARGET}` },
        { duration: `${DURATION}`+'m', target: `${TARGET}` },
      ],
    },
  },

//SLO Thesholds

  thresholds: {
    http_req_failed: [
      {
        threshold: "rate<=0.01",
        abortOnFail: true,
        delayAbortEval: "10s",
      },
    ],
    http_req_duration: [
      {
        threshold: "p(95)<=400",
        abortOnFail: true,
        delayAbortEval: "10s",
      },
    ],
  },

};

export default function() {

  const params = {
    headers: {
      'HOST': `${API_HOST}`,
      'accept': 'text/plain',
      'Content-Type': 'application/json',
    },
  };



  const res = http.get(`${API_BASE_URL}/${API_GET_ENDPOINT}`, params);
  check(res, {
    "GET status is 200": (r) => r.status === 200
  });

//Post data
  const data = { id: `${API_POST_ID}`, name: randomItem(Cities) };
  const put = http.put(`${API_BASE_URL}/${API_POST_ENDPOINT}/${API_POST_ID}`, JSON.stringify(data), params);
  check(put, {
    "PUT status is 200": (p) => p.status === 200
  });

  sleep(1);

}
