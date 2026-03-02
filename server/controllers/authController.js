import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

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

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        first_login: user.first_login
      }
    });
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