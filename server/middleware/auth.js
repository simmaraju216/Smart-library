import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('[Auth] Missing JWT_SECRET in environment.');
    return res.status(500).json({ message: 'Server misconfigured' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};