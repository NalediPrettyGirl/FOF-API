/**
 * Events Route — /events
 * Firestore collection: "events"
 *
 * Document shape:
 *   eventName   : string   — display title
 *   description : string   — short description
 *   date        : string   — ISO date string e.g. "2026-08-10"
 *   day         : number   — day of month (optional, derived from date)
 *   month       : string   — e.g. "AUG" (optional, derived from date)
 *   time        : string   — e.g. "09h00 - 12h00"
 *   venue       : string   — location name
 *   category    : string   — e.g. "Special", "Youth", "Community"
 *   image       : string   — URL to banner image (optional)
 *   createdAt   : Firestore Timestamp (auto-set on POST)
 */

const express  = require('express');
const router   = express.Router();
const admin    = require('firebase-admin');

const db       = admin.firestore();
const COL      = 'events';

/* ── Helpers ──────────────────────────────────── */
function toClient(doc) {
  return { id: doc.id, ...doc.data() };
}

function deriveDate(data) {
  if (data.date && !data.day) {
    const d = new Date(data.date);
    data.day   = d.getDate();
    data.month = d.toLocaleString('en-ZA', { month: 'short' }).toUpperCase();
  }
  return data;
}

/* ── GET /events — list all events ───────────── */
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection(COL).get();
    const events = snap.docs.map(toClient).sort((a, b) => {
      const dA = a.date ? new Date(a.date).getTime() : 0;
      const dB = b.date ? new Date(b.date).getTime() : 0;
      return dA - dB;
    });
    res.json(events);
  } catch (err) {
    console.error('GET /events', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/* ── GET /events/:id — single event ──────────── */
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection(COL).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found' });
    res.json(toClient(doc));
  } catch (err) {
    console.error('GET /events/:id', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/* ── POST /events — create event ─────────────── */
router.post('/', async (req, res) => {
  try {
    const { eventName, description, date, time, venue, category, image } = req.body;
    if (!eventName) return res.status(400).json({ error: 'eventName is required' });

    let data = { eventName, description: description || '', date: date || '', time: time || '', venue: venue || '', category: category || 'Special', image: image || '', createdAt: admin.firestore.FieldValue.serverTimestamp() };
    data = deriveDate(data);

    const ref = await db.collection(COL).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error('POST /events', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/* ── PUT /events/:id — update event ──────────── */
router.put('/:id', async (req, res) => {
  try {
    const { eventName, description, date, time, venue, category, image } = req.body;
    let update = {};
    if (eventName   !== undefined) update.eventName   = eventName;
    if (description !== undefined) update.description = description;
    if (date        !== undefined) { update.date = date; update = deriveDate(update); }
    if (time        !== undefined) update.time        = time;
    if (venue       !== undefined) update.venue       = venue;
    if (category    !== undefined) update.category    = category;
    if (image       !== undefined) update.image       = image;
    update.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found' });

    await ref.update(update);
    res.json({ id: req.params.id, ...doc.data(), ...update });
  } catch (err) {
    console.error('PUT /events/:id', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/* ── DELETE /events/:id — delete event ───────── */
router.delete('/:id', async (req, res) => {
  try {
    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found' });
    await ref.delete();
    res.json({ message: 'Event deleted', id: req.params.id });
  } catch (err) {
    console.error('DELETE /events/:id', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
