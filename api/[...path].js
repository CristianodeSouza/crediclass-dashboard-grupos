const BACKEND_URL = 'https://crediclass-dashboard-grupos-production.up.railway.app';

module.exports = async function handler(req, res) {
  const { path = [] } = req.query;
  const pathSegments = Array.isArray(path) ? path.join('/') : path;

  const queryString = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path') {
      queryString.append(key, value);
    }
  }

  const qs = queryString.toString();
  const targetUrl = `${BACKEND_URL}/api/${pathSegments}${qs ? '?' + qs : ''}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const backendResponse = await fetch(targetUrl, fetchOptions);
    const contentType = backendResponse.headers.get('content-type') || 'application/json';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-cache');

    res.status(backendResponse.status);

    if (contentType.includes('application/json')) {
      const data = await backendResponse.json();
      return res.json(data);
    } else {
      const text = await backendResponse.text();
      return res.send(text);
    }
  } catch (error) {
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
      target: targetUrl
    });
  }
};
