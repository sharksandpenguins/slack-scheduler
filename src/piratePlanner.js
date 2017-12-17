const fs = require('fs');
const gcal = require('../util/googleCalendar.js');

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

// Load client secrets from a local file.
fs.readFile(CLIENT_SECRET, (err, content) => {
  if (err) {
    console.log(`Error loading client secret file: ${err}`);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API.
  // gcal.authorize(JSON.parse(content), gcal.listNextEvent);
  // gcal.authorize(JSON.parse(content), gcal.listCalendars);
  // TODO: Move this TEST CODE somewhere else...
  listEvents(content);
  listCalendars(content);
  getNextEvent(content);
});
