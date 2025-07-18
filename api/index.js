// Vercel serverless function for main API
// This is a fallback - the full Node.js app should be deployed separately

export default function handler(req, res) {
  res.status(503).json({ 
    error: 'API not available in static deployment',
    message: 'Please deploy the full Node.js application for API functionality'
  });
}