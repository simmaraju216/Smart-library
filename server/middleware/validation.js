export const requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === '');
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
  }
  next();
};