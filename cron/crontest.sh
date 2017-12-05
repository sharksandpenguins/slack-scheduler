#!/bin/bash

echo $SLACKSCHEDULER

if [ "$1" = "lunch" ]; then
	curl -X POST -H 'Content-type: application/json' --data '{"text":"LUNCHTIME!"}' $SLACKSCHEDULER
elif [ "$1" = "dinner" ]; then
	curl -X POST -H 'Content-type: application/json' --data '{"text":"DINNERTIME!"}' $SLACKSCHEDULER
else
	curl -X POST -H 'Content-type: application/json' --data '{"text":"Hello, World!"}' $SLACKSCHEDULER
fi
