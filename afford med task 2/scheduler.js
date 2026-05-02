const express = require('express');
const axios = require('axios');
const { Log } = require('./middleware/logger');

const router = express.Router();
const BASE_URL = 'http://20.207.122.201/evaluation-service';

let cachedToken = null;
let tokenExpiry = null;

const getToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    Log('auth', 'info', 'auth', 'Using cached token');
    return cachedToken;
  }

  try {
    Log('auth', 'info', 'auth', 'Requesting new token');
    
    const payload = {
      email: process.env.EMAIL,
      name: process.env.NAME,
      rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    };

    const response = await axios.post(`${BASE_URL}/auth`, payload);

    if (response.data.access_token) {
      cachedToken = response.data.access_token;
      tokenExpiry = Date.now() + 3600000;
      Log('auth', 'success', 'auth', 'Token generated successfully');
      return cachedToken;
    } else {
      const errMsg = response.data.message || response.data.errors?.[0] || 'No token in response';
      throw new Error(errMsg);
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || error.response?.data?.errors?.[0] || error.message;
    Log('auth', 'error', 'auth', `Token generation failed: ${errMsg}`);
    throw new Error(`Auth failed: ${errMsg}`);
  }
};

const fetchWithAuth = async (url) => {
  const token = await getToken();
  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

const knapsack = (tasks, capacity) => {
  const n = tasks.length;
  const dp = Array(capacity + 1).fill(0);
  const selection = Array(capacity + 1).fill(null).map(() => []);

  for (let i = 0; i < n; i++) {
    for (let w = capacity; w >= tasks[i].Duration; w--) {
      const val = dp[w - tasks[i].Duration] + tasks[i].Impact;
      if (val > dp[w]) {
        dp[w] = val;
        selection[w] = [...selection[w - tasks[i].Duration], tasks[i]];
      }
    }
  }

  const maxIdx = dp.indexOf(Math.max(...dp));
  return {
    selectedTasks: selection[maxIdx] || [],
    totalTime: maxIdx,
    totalImpact: dp[maxIdx] || 0
  };
};

router.get('/schedule/:depotId', async (req, res) => {
  try {
    Log('scheduler', 'info', 'scheduler', `Fetching schedule for depot ${req.params.depotId}`);
    
    const depotId = req.params.depotId;
    const depotsRes = await fetchWithAuth(BASE_URL + '/depots');
    const depots = depotsRes.data.data;

    const vehiclesRes = await fetchWithAuth(BASE_URL + '/vehicles');
    const vehicles = vehiclesRes.data.data;

    console.log('Depots:', depots);
    console.log('Vehicles:', vehicles);

    if (!Array.isArray(depots)) {
      throw new Error('Invalid depots data');
    }

    if (!Array.isArray(vehicles)) {
      throw new Error('Invalid vehicles data');
    }

    const depot = depots.find(d => d.depotId == depotId);
    if (!depot) {
      return res.status(404).json({ error: 'Depot not found' });
    }

    const vehiclesForDepot = vehicles.filter(v => v.depotId == depotId);
    const tasks = vehiclesForDepot.map(v => ({
      TaskID: v.taskId,
      Duration: v.duration,
      Impact: v.impact
    }));

    const result = knapsack(tasks, depot.mechanicHours);
    Log('scheduler', 'success', 'scheduler', `Schedule computed with ${result.selectedTasks.length} tasks`);
    
    res.json(result);
  } catch (error) {
    Log('scheduler', 'error', 'scheduler', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
