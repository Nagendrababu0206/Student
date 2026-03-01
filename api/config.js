module.exports = async (_req, res) => {
  const backendUrl = process.env.BACKEND_URL || "";
  res.status(200).json({ backendUrl });
};
