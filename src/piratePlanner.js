const fs = require('fs');
const path = require('path');
const gcal = require('../util/googleCalendar.js');
const slackscheduler = require('../util/slackScheduler.js');

// TODO: configure this somewhere else
const CLIENT_SECRET = 'client_secret.json';

function listEvents(clientSecretContent) {
  gcal.authorize(JSON.parse(clientSecretContent), (auth) => {
    gcal.listEvents(auth)
      .then((events) => {
        if (events.length === 0) {
          console.log('No upcoming events found.');
        } else {
          console.log(`Upcoming ${events.length} events:`);
          for (let i = 0; i < events.length; i += 1) {
            const event = events[i];
            const start = event.start.dateTime || event.start.date;
            const description = event.description || '<no description specified>';
            console.log(`${start} - ${event.summary}: ${description}`);
          }
        }
      })
      .catch((error) => {
        console.log(`Error listing the events: ${error}`);
      });
  });
}

function listCalendars(clientSecretContent) {
  gcal.authorize(JSON.parse(clientSecretContent), (auth) => {
    gcal.listCalendars(auth)
      .then((calendars) => {
        console.log(`Found ${calendars.length} calendars:`);
        calendars.forEach((calendarItem) => {
          console.log('-----------------');
          console.log('id:', calendarItem.id);
          console.log('summary:', calendarItem.summary);
          console.log('description:', calendarItem.description ? calendarItem.description : 'none');
        });
      })
      .catch((error) => {
        console.log(`The CalendarList API returned an error: ${error}`);
      });
  });
}

function getNextEvent(clientSecretContent) {
  gcal.authorize(JSON.parse(clientSecretContent), (auth) => {
    gcal.listNextEvent(auth)
      .then((event) => {
        if (event.length === 0) {
          console.log('No upcoming event found.');
        } else {
          console.log('Upcoming event:');
          const nextEvent = event[0];
          const start = nextEvent.start.dateTime || nextEvent.start.date;
          const description = nextEvent.description || '<no description specified>';
          console.log(`${start} - ${nextEvent.summary}: ${description}`);
        }
      })
      .catch((error) => {
        console.log(`Error listing the events: ${error}`);
      });
  });
}

function sendPost(clientSecretContent) {
  gcal.authorize(JSON.parse(clientSecretContent), (auth) => {
    gcal.listNextEvent(auth)
      .then((event) => {
        if (event.length === 0) {
          console.log('No upcoming event found.');
        } else {
          console.log('Upcoming event:');
          const nextEvent = event[0];
          const start = nextEvent.start.dateTime || nextEvent.start.date;
          const description = nextEvent.description || '<no description specified>';
          console.log(`${start} - ${nextEvent.summary}: ${description}`);
          slackscheduler.sendPost(description);
        }
      })
      .catch((error) => {
        console.log(`Error listing the events: ${error}`);
      });
  });
}

function usage() {
  console.log(`
    Utility script used to fetch data for the Pirate Planner.

      [usage] node ${path.basename(__filename)} <function_name>

        function_name:
          - listCalendars
              get a listing of the user's calendars

          - listEvents
              list events for a user's given calendar

          - getNextEvent
              get next event for a user's given calendar

          - sendPost
              get the next event and send it out to the Slack Scheduler webhook
    `);
}

// simple CLI
// [usage] node ${path.basename(__filename)} <function_name>
if (process.argv.length > 2) {
  const cmd = process.argv[2];

  let funcToExecute;

  if (cmd === 'listCalendars') {
    funcToExecute = listCalendars;
  } else if (cmd === 'listEvents') {
    funcToExecute = listEvents;
  } else if (cmd === 'getNextEvent') {
    funcToExecute = getNextEvent;
  } else if (cmd === 'sendPost') {
    funcToExecute = sendPost;
  }

  if (funcToExecute === undefined) {
    console.log('ERROR: Please enter a valid command-line option');
    usage();
  } else {
    fs.readFile(CLIENT_SECRET, (err, content) => {
      if (err) {
        console.log(`Error loading client secret file: ${err}`);
        return;
      }
      // call our specified function
      funcToExecute(content);
    });
  }
} else {
  usage();
}
