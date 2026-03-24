// unsupported ednpoints

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// error middleware

const errorHandler = (error, req, res, next) => {
  res.status(error.code || 500).json({
    message: error.message || "Server Error"
  })
}

module.exports = { notFound, errorHandler }