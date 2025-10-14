const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const docRef = await db.collection('nuggets').add({ title, description });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Error creating nuggets: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('nuggets').get();
    const nuggets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(nuggets);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching scriptures' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('nuggets').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'nugget not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching scripture' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      return res.status(400).json({ error: 'No data to update' });
    }
    await db.collection('nuggets').doc(req.params.id).update({ title, description });
    res.json({ message: 'nuggets updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating scripture' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.collection('nuggets').doc(req.params.id).delete();
    res.json({ message: 'nuggets deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting nuggets' });
  }
});

module.exports = router;