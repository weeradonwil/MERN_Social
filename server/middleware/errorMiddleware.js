// unsupported ednpoints

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// error middleware

const errorHandler = (error, req, res, next) => {
  const statusCode = error.code || res.statusCode || 500

  console.error("Error:", error)

  let message = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"

  if ([400, 401, 403, 404, 422].includes(statusCode)) {
    message = error.message
  }

  res.status(statusCode).json({
    message
  })
}

module.exports = { notFound, errorHandler }