#!/bin/bash

HOUR=`TZ=UTC-9 date "+%H"`
FOUR_HOUR=`expr $HOUR % 4`
if `test $FOUR_HOUR -eq 0` ; then
  ${OPENSHIFT_REPO_DIR}/bin/task.js > ~/app-root/logs/task.log
fi
if `test $FOUR_HOUR -eq 1` ; then
  ${OPENSHIFT_REPO_DIR}/bin/twit_new.js > ~/app-root/logs/twit_new.log
fi
TWENTYTWO_HOUR=`expr $HOUR % 22`
if `test $TWENTYTWO_HOUR -eq 0` ; then
  ${OPENSHIFT_REPO_DIR}/bin/twit_tomorrow.sh > ~/app-root/logs/twit_tomorrow.log
fi

echo 'cron hourly, HOUR: '$HOUR
