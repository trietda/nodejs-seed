module.exports = function unexpectedErrorHandler(err, req, res) {
  if (process.env.NODE_ENV !== 'production') {
    res.status(500).json({ message: err.message });
    logger.error(err);
  } else {
    res.status(500).json({ message: 'Unexpected error' });
  }
};
