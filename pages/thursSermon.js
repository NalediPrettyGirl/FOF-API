/**
 * Thursday Sermon Route — /thursSermon
 * Firestore collection: "thursSermon"
 *
 * Document shape:
 *   title       : string  — sermon title
 *   description : string  — short summary / teaser
 *   speaker     : string  — preacher name
 *   date        : string  — ISO date e.g. "2026-07-03"
 *   url         : string  — Spotify / Facebook / YouTube link
 *   series      : string  — sermon series name (optional)
 *   duration    : string  — e.g. "45 min" (optional)
 *   createdAt   : Timestamp
 */

const express = require('express');
const router  = express.Router();
const admin   = require('firebase-admin');

const db  = admin.firestore();
const COL = 'thursSermon';

function toClient(doc) {
  return { id: doc.id, ...doc.data() };
}

/* ── GET /thursSermon — list all ─────────────── */
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection(COL).get();
    let docs = snap.docs.map(toClient);
    docs.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
    res.json(docs);
  } catch (err) {
    console.error('GET /thursSermon', err);
    res.status(500).json({ error: 'Failed to fetch Thursday sermons' });
  }
});

/* ── GET /thursSermon/:id ─────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection(COL).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Sermon not found' });
    res.json(toClient(doc));
  } catch (err) {
    console.error('GET /thursSermon/:id', err);
    res.status(500).json({ error: 'Failed to fetch sermon' });
  }
});

/* ── POST /thursSermon — create ───────────────── */
router.post('/', async (req, res) => {
  try {
    const { title, description, speaker, date, url, series, duration } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const data = {
      title,
      description: description || '',
      speaker: speaker || '',
      date: date || '',
      url: url || '',
      series: series || '',
      duration: duration || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection(COL).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error('POST /thursSermon', err);
    res.status(500).json({ error: 'Failed to create sermon' });
  }
});

/* ── PUT /thursSermon/:id — update ───────────── */
router.put('/:id', async (req, res) => {
  try {
    const fields = ['title','description','speaker','date','url','series','duration'];
    const update = {};
    fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    update.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Sermon not found' });
    await ref.update(update);
    res.json({ id: req.params.id, ...doc.data(), ...update });
  } catch (err) {
    console.error('PUT /thursSermon/:id', err);
    res.status(500).json({ error: 'Failed to update sermon' });
  }
});

/* ── DELETE /thursSermon/:id ─────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Sermon not found' });
    await ref.delete();
    res.json({ message: 'Sermon deleted', id: req.params.id });
  } catch (err) {
    console.error('DELETE /thursSermon/:id', err);
    res.status(500).json({ error: 'Failed to delete sermon' });
  }
});

module.exports = router;
