module.exports = async (_req, res) => {
  const raw = process.env.BACKEND_URL || "";
  let normalized = String(raw)
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/health$/i, "")
    .replace(/\/api$/i, "")
    .replace(/\/api\/.*$/i, "");

  try {
    const parsed = new URL(normalized);
    parsed.pathname = parsed.pathname
      .replace(/\/+$/, "")
      .replace(/\/api\/health$/i, "")
      .replace(/\/api$/i, "")
      .replace(/\/api\/.*$/i, "");
    parsed.search = "";
    parsed.hash = "";
    normalized = parsed.toString().replace(/\/+$/, "");
  } catch {
    // Keep regex-normalized value.
  }
  res.status(200).json({ backendUrl: normalized });
};
