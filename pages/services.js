/**
 * Services Route — /services
 * Firestore collection: "services"
 *
 * Document shape:
 *   name : string  — e.g. "Sunday Service"
 *   time : string  — e.g. "Sundays @ 09h00"
 *   createdAt : Timestamp
 *   updatedAt : Timestamp
 */

const express = require('express');
const router  = express.Router();
const admin   = require('firebase-admin');

const db  = admin.firestore();
const COL = 'services';

function toClient(doc) {
  return { id: doc.id, ...doc.data() };
}

/* ── GET /services — list all ─────────────── */
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection(COL).get();
    res.json(snap.docs.map(toClient));
  } catch (err) {
    console.error('GET /services', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

/* ── GET /services/:id ─────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection(COL).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Service not found' });
    res.json(toClient(doc));
  } catch (err) {
    console.error('GET /services/:id', err);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

/* ── POST /services — create ───────────────── */
router.post('/', async (req, res) => {
  try {
    const { name, time, id } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const data = {
      name,
      time: time || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    let ref;
    if (id) {
      ref = db.collection(COL).doc(id);
      await ref.set(data);
    } else {
      ref = await db.collection(COL).add(data);
    }
    
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error('POST /services', err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

/* ── PUT /services/:id — update ───────────── */
router.put('/:id', async (req, res) => {
  try {
    const { name, time } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (time !== undefined) update.time = time;
    update.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      await ref.set({ ...update, name: update.name || req.params.id, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    } else {
      await ref.update(update);
    }
    res.json({ id: req.params.id, ...(doc.data() || {}), ...update });
  } catch (err) {
    console.error('PUT /services/:id', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

/* ── DELETE /services/:id ─────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Service not found' });
    await ref.delete();
    res.json({ message: 'Service deleted', id: req.params.id });
  } catch (err) {
    console.error('DELETE /services/:id', err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;
