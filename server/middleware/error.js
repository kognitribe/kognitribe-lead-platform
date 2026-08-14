export function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production" ? "Server error" : (err.message || "Server error")
  });
}
