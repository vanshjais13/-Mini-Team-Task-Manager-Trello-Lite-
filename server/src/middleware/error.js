export function errorHandler(error, _req, res, _next) {
  if (error.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors.map((item) => item.message)
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong"
  });
}
