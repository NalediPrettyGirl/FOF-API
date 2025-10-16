const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

router.post('/', async (req, res) => {
  try {
    const { verse, reference } = req.body;
    if (!verse || !reference) {
      return res.status(400).json({ error: 'Verse and reference are required' });
    }
    const docRef = await db.collection('scriptures').add({ verse, reference });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Error creating scripture: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('scriptures').get();
    const scriptures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(scriptures);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching scriptures' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('scriptures').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Scripture not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching scripture' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { verse, reference } = req.body;
    if (!verse && !reference) {
      return res.status(400).json({ error: 'No data to update' });
    }
    await db.collection('scriptures').doc(req.params.id).update({ verse, reference });
    res.json({ message: 'Scripture updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating scripture' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.collection('scriptures').doc(req.params.id).delete();
    res.json({ message: 'Scripture deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting scripture' });
  }
});

module.exports = router;