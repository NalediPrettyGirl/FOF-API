const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

router.post('/', async (req, res) => {
  try {
    const { name, age } = req.body;
    if (!name || typeof age !== 'number') {
      return res.status(400).json({ error: 'Invalid data' });
    }
    const docRef = await db.collection('users').add({ name, age });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Error creating user: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, age } = req.body;
    if (!name && typeof age !== 'number') {
      return res.status(400).json({ error: 'No data to update' });
    }
    await db.collection('users').doc(req.params.id).update({ name, age });
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

module.exports = router;