import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const selectProfileById = async (id) => {
  const [rows] = await pool.query(
    `SELECT s.id, s.student_id, s.name, s.email, s.phone, s.batch_id, s.branch_id, s.year, s.role, s.first_login, s.created_at,
            b.name AS batch_name,
            br.name AS branch_name
     FROM students s
     LEFT JOIN batches b ON b.id = s.batch_id
     LEFT JOIN branches br ON br.id = s.branch_id
     WHERE s.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!process.env.JWT_SECRET) {
      console.error('[Auth] Missing JWT_SECRET in environment.');
      return res.status(500).json({ message: 'Server misconfigured' });
    }

    const [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    const profile = await selectProfileById(user.id);

    return res.json({ token, user: profile });
  } catch (error) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      console.error('[Auth] Database schema is missing:', error.sqlMessage);
      return res.status(500).json({ message: 'Database not initialized. Import SQL schema first.' });
    }

    console.error('[Auth] Login failed:', error.message);
    return res.status(500).json({ message: 'Login failed due to a server error.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE students SET password = ?, first_login = 0 WHERE id = ?', [hash, userId]);
    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      console.error('[Auth] Database schema is missing:', error.sqlMessage);
      return res.status(500).json({ message: 'Database not initialized. Import SQL schema first.' });
    }

    console.error('[Auth] Reset password failed:', error.message);
    return res.status(500).json({ message: 'Password reset failed due to a server error.' });
  }
};

export const me = async (req, res) => {
  try {
    const user = await selectProfileById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('[Auth] Fetch profile failed:', error.message);
    return res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const payload = {
      name: req.body?.name,
      email: req.body?.email,
      phone: req.body?.phone
    };

    const updates = [];
    const values = [];

    if (payload.name !== undefined) {
      const name = String(payload.name || '').trim();
      if (name.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters.' });
      }
      updates.push('name = ?');
      values.push(name);
    }

    if (payload.email !== undefined) {
      const email = String(payload.email || '').trim().toLowerCase();
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValidEmail) {
        return res.status(400).json({ message: 'Enter a valid email address.' });
      }

      const [existing] = await pool.query('SELECT id FROM students WHERE email = ? AND id <> ? LIMIT 1', [
        email,
        req.user.id
      ]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Email is already in use by another account.' });
      }

      updates.push('email = ?');
      values.push(email);
    }

    if (payload.phone !== undefined) {
      const phone = String(payload.phone || '').trim();
      if (phone.length > 20) {
        return res.status(400).json({ message: 'Phone number must be 20 characters or less.' });
      }
      updates.push('phone = ?');
      values.push(phone || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No profile fields provided to update.' });
    }

    values.push(req.user.id);
    await pool.query(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`, values);

    const updated = await selectProfileById(req.user.id);

    return res.json({ message: 'Profile updated successfully.', user: updated });
  } catch (error) {
    console.error('[Auth] Update profile failed:', error.message);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
};