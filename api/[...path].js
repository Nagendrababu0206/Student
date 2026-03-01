module.exports = async (req, res) => {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    res.status(500).json({ error: "BACKEND_URL is not configured." });
    return;
  }

  const pathParts = Array.isArray(req.query.path) ? req.query.path : [];
  const targetPath = pathParts.join("/");
  const targetBase = backendUrl.replace(/\/+$/, "");
  const targetUrl = new URL(`${targetBase}/api/${targetPath}`);

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "path") {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => targetUrl.searchParams.append(key, String(item)));
    } else if (value !== undefined) {
      targetUrl.searchParams.set(key, String(value));
    }
  });

  const headers = {};
  Object.entries(req.headers || {}).forEach(([key, value]) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "content-length") {
      return;
    }
    headers[key] = value;
  });

  const method = req.method || "GET";
  const requestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    const isJsonBody = req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body);
    requestInit.body = isJsonBody ? JSON.stringify(req.body) : req.body;
    if (isJsonBody && !headers["content-type"] && !headers["Content-Type"]) {
      requestInit.headers["content-type"] = "application/json";
    }
  }

  try {
    const upstream = await fetch(targetUrl.toString(), requestInit);
    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type");

    if (contentType) {
      res.setHeader("content-type", contentType);
    }
    res.status(upstream.status).send(text);
  } catch (error) {
    res.status(502).json({
      error: "Failed to reach backend service.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
