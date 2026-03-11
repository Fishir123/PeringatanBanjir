/**
 * Middleware autentikasi API Key untuk ESP32
 * ESP32 harus menyertakan header: x-api-key: <API_KEY>
 */
function apiKeyAuth(req, res, next) {
  // Jika API_KEY tidak di-set di .env, lewati autentikasi
  if (!process.env.API_KEY) {
    return next();
  }

  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key diperlukan. Sertakan header x-api-key',
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      message: 'API key tidak valid',
    });
  }

  next();
}

module.exports = { apiKeyAuth };
