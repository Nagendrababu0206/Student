module.exports = async (req, res) => {
  const rawBackendUrl = process.env.BACKEND_URL || "";
  const backendUrl = String(rawBackendUrl)
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/health$/i, "")
    .replace(/\/api$/i, "");

  if (!backendUrl) {
    res.status(500).json({ error: "BACKEND_URL is not configured." });
    return;
  }

  const pathParts = Array.isArray(req.query.path) ? req.query.path : [];
  const targetPath = pathParts.join("/");
  const primaryUrl = new URL(`${backendUrl}/api/${targetPath}`);
  const fallbackUrl = new URL(`${backendUrl}/${targetPath}`);

  const copySearchParams = (url) => {
    Object.entries(req.query).forEach(([key, value]) => {
      if (key === "path") {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, String(item)));
      } else if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  };
  copySearchParams(primaryUrl);
  copySearchParams(fallbackUrl);

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
    let upstream = await fetch(primaryUrl.toString(), requestInit);
    let text = await upstream.text();
    const shouldRetryWithoutApiPrefix =
      upstream.status === 404 &&
      typeof text === "string" &&
      text.toLowerCase().includes("no static resource api");

    if (shouldRetryWithoutApiPrefix) {
      upstream = await fetch(fallbackUrl.toString(), requestInit);
      text = await upstream.text();
    }

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
