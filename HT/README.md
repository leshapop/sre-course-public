# MTS sre-course homework leshapop@gmail.com (Student71)
WEB-API Forecast hiload testing

![homework postgresql cluster](./images/pg_cluster.png)

Install testing tool

- First you need to install k6
   - ???
   - Edit `run-test.sh` if you need use prometheus + grafana k6 dashboard.
   - THEN RUN:
  ```
  ./run-test <select-test-profile.js>

  ```

Нагрузочное тестирование WEB API - weather.student71.local

1. Вводные данные
Headers:
-H 'Host: weather.student71.local'
-H 'accept: text/plain'
-H 'Content-Type: application/json'

Endpoints - GET:
WeatherForecast/
Cities/1
Forecast/1

Endpoints - POST:
Cities/
  "id": 0,
  "name": "text"
  
Forecast/${Cities_id}
  "id": 0,
  "cityId": "0",
  "dateTime": 0,
  "temperature": "0",
  "summary": "text"

2. Требования SLA/SLO

SLA: 
1. Request duration P95 <= 600ms
2. Error rate < 2%
3. Max Load time 8m

SLO:
1. Request duration P95 <= 500ms
2. Error rate <= 1%
3. Max Load time 10m

3. Инструменты:
K6 Grafana

4. Профили нагрузки:

1. Breakpoint test (web-api-test-breakpoint.js) 1:1 (GET/POST)
Описание: Постепенное увеличение нагрузки до критической.
Цели: Поиск максимума нагрузки RPS, поиск узкого места, происк точки отказа.
Методы: GET (ALL)
Методы: POST Cities

3. Stress test (web-api-test-stress.js) 1:1 (GET/POST)
Описание: Постепенное увеличение нагрузки до 90% от максимума. Поддержание нагрузки 1 x Max Load time.
Цели: Проверка выполнения SLO за расчетное время под нагрузкой 90% от максимума 1 x Max Load time.
Методы: GET (ALL) 80%
Методы: POST Cities 10%

5. Daily Test (web-api-test-daily.js) 1:1 (GET/POST)
Описание: Поддержание нагрузки 50% от максимума 2 x Max Load time.
Цели: Проверка выполнения SLO под стандартной дневной нагрузкой определенной в 50% от максимума за 2 x Max Load time.
Методы: GET (ALL) 45%
Методы: POST Cities 5%

6. Отчет о тестировании:

Breakpoint test: 
При НТ 1:1 (GET/POST) >800 req/s возникает деградация сервиса, загрузка DB 100% по CPU, загрузка ПОДов 100%, Request duration P95 > 7s. Достигнуто узкое место в системе.
✗ http_req_duration: max=21.09s   p(90)=6.54s    p(95)=8.75s
После падения нагрузки, сервис приходит в норму.

При НТ 1:1 (GET/POST) >620 req/s происходит срабатывание порога SLO Request duration P95 > 400ms
✗ http_req_duration: max=4.01s    p(90)=47.56ms  p(95)=606.59ms
После падения нагрузки, сервис приходит в норму.
Следовательно для следующих тестов определим:
Максимальную производительность системы при 1:1 (GET/POST) в 600 RPS, при условии соблюдении требования SLO. (на постоянной основе)
Максимальную допустимую производительность системы при 1:1 (GET/POST) в 800 RPS, при НЕ соблюдении требования SLO. (например для возможных скачков нагрузки)

Stress test:
90% от 600 RPS = 540 RPS в течении Max Load time 6m
При условии 1:1 (GET/POST) ~270 RPS/ ~270 RPS наблюдается стабильная работа системы. POD CPU load ~70%, DB CPU load ~40%, DB iops ~90% utilization.
http_req_duration: avg=19.06ms min=2.2ms  med=5.08ms  max=4s p(90)=8.35ms   p(95)=9.37ms
Время ответа не выходит за рамки SLO. Ошибок нет.

Daily Test:
50% от 600 RPS = 300 RPS в течении Max Load time 12m
При условии 1:1 (GET/POST) ~150 RPS/ ~150 RPS наблюдается стабильная работа системы. POD CPU load ~50%, DB CPU load ~30%, DB iops ~55% utilization.
Время ответа не выходит за рамки SLO. Ошибок нет.
