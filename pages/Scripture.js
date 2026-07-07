/**
 * Scripture / Quote Route — /quote
 * Firestore collection: "scripture"
 *
 * Document shape (single "current" doc recommended, or one doc per week):
 *   sun  : string  — e.g. "Joshua chapter 7"
 *   mon  : string
 *   tue  : string
 *   wed  : string
 *   thu  : string
 *   fri  : string
 *   sat  : string
 *   weekLabel : string  — optional label, e.g. "Week of July 7"
 *   updatedAt : Timestamp
 */

const express = require('express');
const router  = express.Router();
const admin   = require('firebase-admin');

const db  = admin.firestore();
const COL = 'scripture';

function toClient(doc) {
  return { id: doc.id, ...doc.data() };
}

/* ── GET /quote — get all scripture docs ─────── */
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection(COL).orderBy('updatedAt', 'desc').limit(10).get();
    res.json(snap.docs.map(toClient));
  } catch (err) {
    // If no docs or no index yet, fallback without ordering
    try {
      const snap = await db.collection(COL).get();
      res.json(snap.docs.map(toClient));
    } catch (e) {
      console.error('GET /quote', e);
      res.status(500).json({ error: 'Failed to fetch scripture' });
    }
  }
});

/* ── GET /quote/current — latest scripture week ─ */
router.get('/current', async (req, res) => {
  try {
    const snap = await db.collection(COL).orderBy('updatedAt', 'desc').limit(1).get();
    if (snap.empty) return res.status(404).json({ error: 'No scripture found' });
    res.json(toClient(snap.docs[0]));
  } catch (err) {
    // Fallback: just get any doc
    try {
      const snap = await db.collection(COL).limit(1).get();
      if (snap.empty) return res.status(404).json({ error: 'No scripture found' });
      res.json(toClient(snap.docs[0]));
    } catch (e) {
      console.error('GET /quote/current', e);
      res.status(500).json({ error: 'Failed to fetch current scripture' });
    }
  }
});

/* ── GET /quote/:id — specific scripture doc ──── */
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection(COL).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Scripture not found' });
    res.json(toClient(doc));
  } catch (err) {
    console.error('GET /quote/:id', err);
    res.status(500).json({ error: 'Failed to fetch scripture' });
  }
});

/* ── POST /quote — create scripture week ─────── */
router.post('/', async (req, res) => {
  try {
    const { sun, mon, tue, wed, thu, fri, sat, weekLabel } = req.body;
    const data = {
      sun: sun || '', mon: mon || '', tue: tue || '',
      wed: wed || '', thu: thu || '', fri: fri || '', sat: sat || '',
      weekLabel: weekLabel || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection(COL).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error('POST /quote', err);
    res.status(500).json({ error: 'Failed to create scripture' });
  }
});

/* ── PUT /quote/:id — update scripture week ──── */
router.put('/:id', async (req, res) => {
  try {
    const { sun, mon, tue, wed, thu, fri, sat, weekLabel } = req.body;
    const update = {};
    ['sun','mon','tue','wed','thu','fri','sat','weekLabel'].forEach(k => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });
    update.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Scripture not found' });
    await ref.update(update);
    res.json({ id: req.params.id, ...doc.data(), ...update });
  } catch (err) {
    console.error('PUT /quote/:id', err);
    res.status(500).json({ error: 'Failed to update scripture' });
  }
});

/* ── DELETE /quote/:id — delete scripture doc ─── */
router.delete('/:id', async (req, res) => {
  try {
    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Scripture not found' });
    await ref.delete();
    res.json({ message: 'Scripture deleted', id: req.params.id });
  } catch (err) {
    console.error('DELETE /quote/:id', err);
    res.status(500).json({ error: 'Failed to delete scripture' });
  }
});

module.exports = router;
