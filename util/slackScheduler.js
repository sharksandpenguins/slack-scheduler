// This utility will send data over to our Slack app endpoint

const axios = require('axios');

const CONFIG = {
  webhook: process.env.SLACKSCHEDULERHOOK || 'Please give me a Slack hook',
};

const sendPost = (formattedText) => {
  axios.post(CONFIG.webhook, {
    text: formattedText,
  }).then((response) => {
    console.log(response);
  }).catch((error) => {
    console.log(error);
  });
};

module.exports.sendPost = sendPost;
