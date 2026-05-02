const express = require('express');
const axios = require('axios');
const { Log } = require('./middleware/logger');

const router = express.Router();
const API_URL = 'http://20.207.122.201/evaluation-service';

let notificationId = 1;
const store = {};

router.get('/notifications', (req, res) => {
  try {
    const notifs = Object.values(store).flat();
    Log('notifications', 'success', 'notifications', 'Retrieved all');
    res.json(notifs);
  } catch (error) {
    Log('notifications', 'error', 'notifications', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/notifications/unread/:userId', (req, res) => {
  try {
    const unread = (store[req.params.userId] || []).filter(n => !n.read);
    Log('notifications', 'success', 'notifications', `Retrieved ${unread.length} unread`);
    res.json(unread);
  } catch (error) {
    Log('notifications', 'error', 'notifications', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/notifications/read', (req, res) => {
  try {
    const { notificationIds } = req.body;
    let count = 0;
    Object.values(store).forEach(userNotifs => {
      userNotifs.forEach(n => {
        if (notificationIds.includes(n.id)) {
          n.read = true;
          count++;
        }
      });
    });
    Log('notifications', 'success', 'notifications', `Marked ${count} as read`);
    res.json({ markedCount: count });
  } catch (error) {
    Log('notifications', 'error', 'notifications', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/notifications/priority/:n', async (req, res) => {
  try {
    const n = parseInt(req.params.n, 10);
    Log('notifications', 'info', 'notifications', `Fetching top ${n} priority`);
    
    const response = await axios.get(`${API_URL}/notifications`);
    const notifs = response.data;

    const sorted = notifs.sort((a, b) => {
      const priority = { 'Placement': 3, 'Result': 2, 'Event': 1 };
      const pA = priority[a.type] || 0;
      const pB = priority[b.type] || 0;
      
      if (pA !== pB) return pB - pA;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    Log('notifications', 'success', 'notifications', `Returned ${Math.min(n, sorted.length)} priority`);
    res.json(sorted.slice(0, n));
  } catch (error) {
    Log('notifications', 'error', 'notifications', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/notifications', (req, res) => {
  try {
    const { userId, message, type } = req.body;
    const notif = {
      id: notificationId++,
      userId,
      message,
      type,
      read: false,
      timestamp: new Date()
    };
    
    if (!store[userId]) store[userId] = [];
    store[userId].push(notif);
    Log('notifications', 'info', 'notifications', `Created for ${userId}`);
    res.json(notif);
  } catch (error) {
    Log('notifications', 'error', 'notifications', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
