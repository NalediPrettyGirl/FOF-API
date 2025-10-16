const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

router.post('/', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'description are required' });
    }
    const docRef = await db.collection('quote').add({ description });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Error creating quote: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('quote').get();
    const quote = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching quote' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('quote').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching quote' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'No data to update' });
    }
    await db.collection('quote').doc(req.params.id).update({ description});
    res.json({ message: 'Quote updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating quote' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.collection('quote').doc(req.params.id).delete();
    res.json({ message: 'Quote deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting quote' });
  }
});

module.exports = router;