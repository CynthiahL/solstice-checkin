export const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler Triggered]: ${err.stack || err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'A fatal server-side exception occurred.';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
};
