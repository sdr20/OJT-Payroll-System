const isAdmin = (req, res, next) => {
  const userRole = req.headers['user-role'];
  console.log('Received user-role:', userRole);
  if (!userRole || userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { isAdmin };