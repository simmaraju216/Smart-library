import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // PRODUCTION: Always provide JWT_SECRET via environment variables and do not rely on fallback value.
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_me');
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};