const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const GoogleAuth = require('google-auth-library');

// USER CONFIG - CONFIGURABLE VARIABLES HERE
const CALENDAR_ID = process.env.PIRATE_CALENDAR_ID || 'primary';

// DEFAULTS
const DEFAULT_EVENT_RESULTS_MAX = 10;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = `${TOKEN_DIR}calendar-nodejs-quickstart.json`;
const APP_NAME = 'PIRATE_PLANNER';

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log(`Token stored to ${TOKEN_PATH}`);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log(`Authorize the ${APP_NAME} app by visiting this url: ${authUrl}`);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log(`Error while trying to retrieve access token: ${err}`);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const auth = new GoogleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Lists the calendars available for this user
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listCalendars(auth) {
  return new Promise((resolve, reject) => {
    const calendar = google.calendar('v3');

    calendar.calendarList.list({ auth }, (err, response) => {
      if (err) {
        reject(new Error(`The CalendarList API returned an error: ${err}`));
      } else {
        const calendars = response.items;
        resolve(calendars);
      }
    });
  });
}

/**
 * Lists the next 10 events on the user's specified calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, maxResults = DEFAULT_EVENT_RESULTS_MAX, calendarId = CALENDAR_ID) {
  return new Promise((resolve, reject) => {
    const calendar = google.calendar('v3');

    calendar.events.list({
      auth: auth,
      calendarId: calendarId,
      timeMin: (new Date()).toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, response) => {
      if (err) {
        console.log(`The API returned an error: ${err}`);
        // return;
        reject(new Error(`The API returned an error: ${err}`));
      } else {
        const events = response.items;
        resolve(events);
      }
    });
  });
}

/**
 * Lists the next event on the user's specified calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listNextEvent(auth, calendarId = CALENDAR_ID) {
  return listEvents(auth, 1, calendarId);
}

module.exports.authorize = authorize;
module.exports.listCalendars = listCalendars;
module.exports.listEvents = listEvents;
module.exports.listNextEvent = listNextEvent;
