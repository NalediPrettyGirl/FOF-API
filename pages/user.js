/**
 * Users Route — /users
 * Firestore collection: "users"
 *
 * Document shape:
 *   name      : string   — full name
 *   email     : string   — email address
 *   phone     : string   — contact number (optional)
 *   role      : string   — "admin" | "member" | "visitor" (default: "member")
 *   branch    : string   — church branch (optional, e.g. "Zakariyya Park")
 *   joinedAt  : Timestamp
 *   updatedAt : Timestamp
 *
 * NOTE: Passwords are NOT stored here — use Firebase Auth for authentication.
 *       This collection stores profile/membership data only.
 */

const express = require('express');
const router  = express.Router();
const admin   = require('firebase-admin');

const db  = admin.firestore();
const COL = 'users';

function toClient(doc) {
  return { id: doc.id, ...doc.data() };
}

/* ── GET /users — list all users ─────────────── */
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection(COL).orderBy('name', 'asc').get();
    res.json(snap.docs.map(toClient));
  } catch (err) {
    try {
      const snap = await db.collection(COL).get();
      res.json(snap.docs.map(toClient));
    } catch (e) {
      console.error('GET /users', e);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
});

/* ── GET /users/:id — single user ────────────── */
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection(COL).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    res.json(toClient(doc));
  } catch (err) {
    console.error('GET /users/:id', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/* ── POST /users — create user profile ───────── */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role, branch } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

    // Check for duplicate email
    const existing = await db.collection(COL).where('email', '==', email).limit(1).get();
    if (!existing.empty) return res.status(409).json({ error: 'A user with this email already exists' });

    const data = {
      name,
      email,
      phone: phone || '',
      role: role || 'member',
      branch: branch || '',
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection(COL).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error('POST /users', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/* ── PUT /users/:id — update user profile ─────── */
router.put('/:id', async (req, res) => {
  try {
    const fields = ['name', 'email', 'phone', 'role', 'branch'];
    const update = {};
    fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    if (Object.keys(update).length === 0) return res.status(400).json({ error: 'No valid fields provided' });
    update.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    await ref.update(update);
    res.json({ id: req.params.id, ...doc.data(), ...update });
  } catch (err) {
    console.error('PUT /users/:id', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/* ── DELETE /users/:id — delete user ─────────── */
router.delete('/:id', async (req, res) => {
  try {
    const ref = db.collection(COL).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    await ref.delete();
    res.json({ message: 'User deleted', id: req.params.id });
  } catch (err) {
    console.error('DELETE /users/:id', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
