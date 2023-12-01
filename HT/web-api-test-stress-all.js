import http from "k6/http";
import { check, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

//Basic variables

const API_BASE_URL = 'http://91.185.85.213'
const API_GET_ENDPOINT1 = 'WeatherForecast'
const API_GET_ENDPOINT2 = 'Cities/1'
const API_HOST = 'weather.student71.local'
const API_ENDPOINTS = ['Cities', 'Forecast'];
const VUS = [1, 1]
const TARGET = [50, 50]
const DURATION = ['1m', '1m'] // SLO Load time
const SLO_ERRORS = 'rate<=0.01'
const SLO_REQ_DURATION = 'p(95)<=500'
const SLO_ERRORS_ABORT = true
const SLO_REQ_DURATION_ABORT = true

//Fake data for POST REQ
let Cityid = [2, 3, 4];
let Cities = ['TEST_Казань', 'TEST_Тверь', 'TEST_Белгород', 'TEST_Рязань', 'TEST_Таганрог', 'TEST_Новочеркасск', 'TEST_Ростов-на-Дону', 'TEST_Москва'];
let Summary = ['TEST_Облачно', 'TEST_Солнечно', 'TEST_Дождь', 'TEST_Ясно', 'TEST_Снег'];

//options
export const options = {
  scenarios: {
    cities: {
      executor: 'ramping-arrival-rate',
      exec: 'stress_cities',
      startTime: '1s',
      gracefulStop: '1s',

      StartRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: `${VUS[0]}`,
      stages: [
        { target: `${TARGET[0]}`, duration: `${DURATION[0]}` },
      ],
    },
    forecast: {
      executor: 'ramping-arrival-rate',
      exec: 'stress_forecast',
      startTime: '1s',
      gracefulStop: '1s',

      StartRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: `${VUS[1]}`,
      stages: [
        { target: `${TARGET[1]}`, duration: `${DURATION[1]}` },
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

//  console.log("******");

  const res = http.get(`${API_BASE_URL}/${API_ENDPOINTS[0]}/`, params);
//  let API_POST_ID = randomItem(res.json("#.id"));
  let API_POST_ID = randomItem(Cityid);

  const res_get_cityid = http.get(`${API_BASE_URL}/${API_ENDPOINTS[0]}/${API_POST_ID}`, params);
  let API_PUT_CITY_NAME = res_get_cityid.json("name");
//  console.log("DEFAULT VALUE = "+API_PUT_CITY_NAME);

  let data = { id: `${API_POST_ID}`, name: randomItem(Cities) };
  const put = http.put(`${API_BASE_URL}/${API_ENDPOINTS[0]}/${API_POST_ID}`, JSON.stringify(data), params);

  const res_get_cityid2 = http.get(`${API_BASE_URL}/${API_ENDPOINTS[0]}/${API_POST_ID}`, params);
  let API_PUT_CITY_NAME2 = res_get_cityid2.json("name");
//  console.log("NEW VALUE = "+API_PUT_CITY_NAME2);

  let data_back = { id: `${API_POST_ID}`, name: `${API_PUT_CITY_NAME}` };
  const put_back = http.put(`${API_BASE_URL}/${API_ENDPOINTS[0]}/${API_POST_ID}`, JSON.stringify(data_back), params);

  const res_get_cityid3 = http.get(`${API_BASE_URL}/${API_ENDPOINTS[0]}/${API_POST_ID}`, params);
  let API_PUT_CITY_NAME3 = res_get_cityid3.json("name");
//  console.log("RETURN VALUE = "+API_PUT_CITY_NAME3);

  check(res, {
    "C_res status is 200": (r) => r.status === 200
  });
  check(res_get_cityid, {
    "C_res_get_cityid status is 200": (r) => r.status === 200
  });
  check(put, {
    "C_put status is 200": (r) => r.status === 200
  });
  check(put_back, {
    "C_put_back status is 200": (r) => r.status === 200
  });

  sleep(1);

}

//Cities endpoints requests
export function stress_forecast() {

//  console.log("******");

  let res = http.get(`${API_BASE_URL}/${API_ENDPOINTS[1]}/`, params);
//  let API_POST_ID = randomItem(res.json("#.id"));
  let API_POST_ID = randomItem(Cityid);

  let res_get_forecastid = http.get(`${API_BASE_URL}/${API_ENDPOINTS[1]}/${API_POST_ID}`, params);
  let API_PUT_FORECAST_SUMMARY = res_get_forecastid.json();
//  console.log("DEFAULT VALUE = "+API_PUT_FORECAST_SUMMARY.summary);

  let data = { id: `${API_POST_ID}`, cityId: API_PUT_FORECAST_SUMMARY.cityId, datetime: 222222222, temperature: 111111, summary: randomItem(Summary) };
  let put = http.put(`${API_BASE_URL}/${API_ENDPOINTS[1]}/${API_POST_ID}`, JSON.stringify(data), params);

  let res_get_forecastid2 = http.get(`${API_BASE_URL}/${API_ENDPOINTS[1]}/${API_POST_ID}`, params);
  let API_PUT_FORECAST_SUMMARY2 = res_get_forecastid2.json("summary");
//  console.log("NEW VALUE = "+API_PUT_FORECAST_SUMMARY2);

  let data_back = { id: `${API_POST_ID}`, cityId: API_PUT_FORECAST_SUMMARY.cityId, datetime: API_PUT_FORECAST_SUMMARY.datetime, temperature: API_PUT_FORECAST_SUMMARY.temperature, summary: API_PUT_FORECAST_SUMMARY.summary };
  let put_back = http.put(`${API_BASE_URL}/${API_ENDPOINTS[1]}/${API_POST_ID}`, JSON.stringify(data_back), params);

  let res_get_forecastid3 = http.get(`${API_BASE_URL}/${API_ENDPOINTS[1]}/${API_POST_ID}`, params);
  let API_PUT_FORECAST_SUMMARY3 = res_get_forecastid3.json("summary");
//  console.log("RETURN VALUE = "+API_PUT_FORECAST_SUMMARY3);

  check(res, {
    "FC_res status is 200": (r) => r.status === 200
  });
  check(res_get_forecastid, {
    "FC_res_get_forecastid status is 200": (r) => r.status === 200
  });
  check(put, {
    "FC_PUT status is 200": (r) => r.status === 200
  });
  check(put_back, {
    "FC_put_back status is 200": (r) => r.status === 200
  });

  sleep(1);

}