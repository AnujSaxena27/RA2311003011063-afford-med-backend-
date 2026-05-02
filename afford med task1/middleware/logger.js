const axios = require('axios');
const { getToken } = require('../services/auth');

const validStacks = ['backend', 'frontend'];
const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
const validPackages = [
  'cache', 'controller', 'cron_job', 'db', 'domain',
  'handler', 'repository', 'route', 'service', 'auth',
  'config', 'middleware', 'utils'
];

const LOGS_URL = process.env.LOGS_URL || 'http://localhost:3000/evaluation-service/logs';

async function Log(stack, level, pkg, message) {
  if (!validStacks.includes(stack)) {
    return;
  }

  if (!validLevels.includes(level)) {
    return;
  }

  if (!validPackages.includes(pkg)) {
    return;
  }

  try {
    const token = await getToken();
    if (!token) {
      return;
    }

    await axios.post(LOGS_URL, {
      stack,
      level,
      package: pkg,
      message
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 5000
    });
  } catch (error) {
    return;
  }
}

module.exports = { Log };
