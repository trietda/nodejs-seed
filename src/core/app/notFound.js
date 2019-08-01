module.exports = function notFoundHandler(req, res) {
  res.status(404).send('Resource not found');
};
