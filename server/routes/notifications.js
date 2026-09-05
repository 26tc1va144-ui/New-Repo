import express from 'express';
import { db } from '../db.js';
import { realtime } from '../realtime.js';

const router = express.Router();

// Get notifications for a user
router.get('/:userId', (req, res) => {
  try {
    const notifications = db.getNotifications(req.params.userId);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark single notification as read
router.put('/:id/read', (req, res) => {
  try {
    const updated = db.markNotificationRead(req.params.id);
    res.json({ success: true, notification: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read for a user
router.put('/read-all/:userId', (req, res) => {
  try {
    db.markAllNotificationsRead(req.params.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create notification
router.post('/', (req, res) => {
  try {
    const newNotif = db.createNotification(req.body);
    realtime.broadcast('NOTIFICATION_CREATED', { notification: newNotif });
    res.status(201).json(newNotif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
