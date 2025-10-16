const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

router.post('/', async (req, res) => {
  try {
    const { day, month, eventName, setting, description } = req.body;
    if (!day || !month || !eventName || !setting || !description) {
      return res.status(400).json({ error: 'Information is required' });
    }
    const docRef = await db.collection('events').add({ day, month, eventName, setting, description });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Error creating events: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('events').get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('events').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'event not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { day, month, eventName, setting, description } = req.body;
    if (!day && !month && !eventName && !setting && ! description){
      return res.status(400).json({ error: 'No data to update' });
    }
    await db.collection('events').doc(req.params.id).update({ day, month, eventName, setting, description });
    res.json({ message: 'events updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating events' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.collection('events').doc(req.params.id).delete();
    res.json({ message: 'events deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting events' });
  }
});

module.exports = router;