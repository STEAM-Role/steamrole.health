'use strict';

const Queue = require('bull');
const healthQueue = new Queue('health-server');
const request = require('request-promise');
const checks = require('./lib/healthcheck.json');
const notify = require('./lib/slack-notify');
const $P = require('bluebird');

healthQueue.process(async(job, done) => {
  console.log(`Executed health check ${(new Date()).toISOString()}`);
  const promises = checks.map(task => healthcheck(task));
  await $P.all(promises);
  done();
});

function healthcheck(task) {
  return new $P(resolve => {
    request(task.url)
      .catch(() => notification(task))
      .finally(() => resolve(true));
  });
}

function notification(task) {
  notify({
    'attachments': [{
      'fallback': `Health fails on ${task.env} with ${task.url}`,
      'color': '#DC143C',
      'pretext': `Health fails on ${task.env} with ${task.url}`,
      'author_name': 'Healthcheck API',
      'title': `API on ${task.env} is down`,
      'text': task.message,
      'footer': 'STEAM Role API',
      'footer_icon': 'https://platform.slack-edge.com/img/default_application_icon.png',
      'ts': Math.round((new Date()).getTime() / 1000)
    }]
  });
}
healthQueue.add({}, {
  repeat: {
    cron: '* * * * *'
  }
});
