module.exports = function unexpectedErrorHandler(err, req, res) {
  res.sendStatus(500);
  logger.error(err);
};
