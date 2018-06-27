'use strict';

const ENDPOINT = 'https://hooks.slack.com/services/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';
const slack = require('slack-notify')(ENDPOINT);

module.exports = slack.extend({
  channel: '#github-commits',
  icon_emoji: ':rotating_light:',
  username: 'Healthchecker'
});
