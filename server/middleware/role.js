export const allowRoles = (...roles) => (req, res, next) => {
  const allowedRoles = roles
    .flat()
    .filter((role) => role !== undefined && role !== null)
    .map((role) => String(role).trim().toLowerCase());

  const currentRole = req.user?.role ? String(req.user.role).trim().toLowerCase() : null;

  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};