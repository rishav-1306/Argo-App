const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Google Sheets API errors
  if (err.code === 403 && err.errors) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to Google Sheets. Check credentials.',
    });
  }

  if (err.code === 404) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found.',
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
