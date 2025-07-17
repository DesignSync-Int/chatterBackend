// Simple in-memory captcha store for session validation
// In production, this should be replaced with Redis or database storage
const captchaStore = new Map();

// Clean up expired captchas every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of captchaStore.entries()) {
    if (now - value.timestamp > 300000) { // 5 minutes
      captchaStore.delete(key);
    }
  }
}, 300000);

// Generate a captcha session ID
export const generateCaptchaSession = () => {
  return `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Store captcha for validation
export const storeCaptcha = (sessionId, captchaCode) => {
  captchaStore.set(sessionId, {
    code: captchaCode.toLowerCase(),
    timestamp: Date.now(),
    attempts: 0
  });
};

// Validate captcha
export const validateCaptcha = (sessionId, userInput) => {
  const captchaData = captchaStore.get(sessionId);
  
  if (!captchaData) {
    return { isValid: false, error: 'Captcha session expired or invalid' };
  }
  
  // Check if too many attempts
  if (captchaData.attempts >= 3) {
    captchaStore.delete(sessionId);
    return { isValid: false, error: 'Too many failed attempts' };
  }
  
  // Increment attempts
  captchaData.attempts++;
  
  // Check if expired (5 minutes)
  if (Date.now() - captchaData.timestamp > 300000) {
    captchaStore.delete(sessionId);
    return { isValid: false, error: 'Captcha expired' };
  }
  
  // Validate the captcha
  const isValid = captchaData.code === userInput.toLowerCase();
  
  if (isValid) {
    captchaStore.delete(sessionId); // Remove after successful validation
    return { isValid: true };
  } else {
    return { isValid: false, error: 'Invalid captcha' };
  }
};

// Middleware for captcha validation
export const validateCaptchaMiddleware = (req, res, next) => {
  const { captchaSessionId, captchaValue } = req.body;
  
  if (!captchaSessionId || !captchaValue) {
    return res.status(400).json({ 
      message: 'Captcha verification required' 
    });
  }
  
  const validation = validateCaptcha(captchaSessionId, captchaValue);
  
  if (!validation.isValid) {
    return res.status(400).json({ 
      message: validation.error || 'Invalid captcha' 
    });
  }
  
  next();
};
