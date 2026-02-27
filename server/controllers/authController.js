import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'change_me', {
    expiresIn: '1d'
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      first_login: user.first_login
    }
  });
};

export const resetPassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE students SET password = ?, first_login = 0 WHERE id = ?', [hash, userId]);
  res.json({ message: 'Password reset successful' });
};