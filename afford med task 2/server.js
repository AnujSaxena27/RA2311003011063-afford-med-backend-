require("dotenv").config();

const express = require('express');
const { Log } = require('./middleware/logger');
const scheduler = require('./scheduler');
const notifications = require('./notifications');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  Log('middleware', 'info', 'api', `${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/', scheduler);
app.use('/', notifications);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  Log('server', 'error', 'api', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  Log('server', 'info', 'api', `Server running on port ${PORT}`);
});

module.exports = { Log };
