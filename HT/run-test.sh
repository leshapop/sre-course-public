#!/bin/bash

USAGE="USAGE: $0 Your-test-script.js"

if [[ -z $1 ]]; then
    echo "Error. Missing argument. (test-script.js)"
    echo $USAGE
    exit
fi

#Edit this for your prometheus configuration
K6_PROMETHEUS_RW_SERVER_URL='http://localhost:9090/api/v1/write' \
K6_PROMETHEUS_RW_USERNAME='USER' \
K6_PROMETHEUS_RW_PASSWORD='PASSWORD' \
K6_PROMETHEUS_RW_TREND_STATS='p(90),p(95),p(99),min,max' \
k6 run -o experimental-prometheus-rw $1