require('dotenv').config();
const express = require('express');
const { Log } = require('./logging_middleware/logger');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Use GET /test or POST /test'
  });
});

app.get('/test', async (req, res) => {
  await Log('backend', 'info', 'route', 'test started');
  res.json({ success: true });
  await Log('backend', 'info', 'route', 'test success');
});

app.post('/test', async (req, res) => {
  try {
    throw new Error('Simulated error');
  } catch (error) {
    await Log('backend', 'error', 'handler', 'test error');
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT);

module.exports = app;
