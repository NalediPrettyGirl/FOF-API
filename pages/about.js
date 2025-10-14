const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const docRef = await db.collection('about').add({ title, content });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Error creating about entry: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('about').get();
    const abouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(abouts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching about entries' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('about').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'About entry not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching about entry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title && !content) {
      return res.status(400).json({ error: 'No data to update' });
    }
    await db.collection('about').doc(req.params.id).update({ title, content });
    res.json({ message: 'About entry updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating about entry' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.collection('about').doc(req.params.id).delete();
    res.json({ message: 'About entry deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting about entry' });
  }
});

module.exports = router;