module.exports = async (_req, res) => {
  const raw = process.env.BACKEND_URL || "";
  const normalized = String(raw)
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/health$/i, "")
    .replace(/\/api$/i, "");
  res.status(200).json({ backendUrl: normalized });
};
