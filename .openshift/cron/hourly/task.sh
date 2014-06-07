#!/bin/bash

cd ~/app-root/repo

HOUR=`date "+%H"`
FOUR_HOUR=`expr $HOUR % 4`
if `test $FOUR_HOUR -eq 0` ; then
  ${OPENSHIFT_REPO_DIR}/bin/task.js > ~/app-root/logs/task.log
fi
if `test $FOUR_HOUR -eq 1` ; then
  ${OPENSHIFT_REPO_DIR}/bin/twit_new.js > ~/app-root/logs/twit_new.log
fi
if `test $HOUR -eq 22` ; then
  ${OPENSHIFT_REPO_DIR}/bin/twit_tomorrow.js > ~/app-root/logs/twit_tomorrow.log
fi

echo 'cron hourly on HOUR: '$HOUR
