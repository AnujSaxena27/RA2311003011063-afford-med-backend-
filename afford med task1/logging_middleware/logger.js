const axios = require('axios');
const { getToken } = require('./auth');

const validStacks = ['backend', 'frontend'];
const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
const validPackages = [
  'cache', 'controller', 'cron_job', 'db', 'domain',
  'handler', 'repository', 'route', 'service', 'auth',
  'config', 'middleware', 'utils'
];

async function Log(stack, level, pkg, message) {
  if (!validStacks.includes(stack) || !validLevels.includes(level) || !validPackages.includes(pkg)) {
    return;
  }

  try {
    const token = await getToken();
    if (!token) {
      console.log('[LOG] No token');
      return;
    }

    await axios.post(
      'http://20.207.122.201/evaluation-service/logs',
      {
        stack,
        level,
        package: pkg,
        message
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
  } catch (error) {
    console.error('[LOG] Error:', error.message);
    if (error.response?.data) {
      console.error('[LOG] Response:', JSON.stringify(error.response.data));
    }
  }
}

module.exports = { Log };
