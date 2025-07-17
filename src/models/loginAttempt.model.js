import mongoose from 'mongoose';

// Schema to track login attempts
const loginAttemptSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  lastAttempt: {
    type: Date,
    default: Date.now,
  },
  blockedUntil: {
    type: Date,
    default: null,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// TTL index to automatically remove old records after 24 hours
loginAttemptSchema.index({ lastAttempt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);

// Configuration for rate limiting
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  blockDuration: 30 * 60 * 1000, // 30 minutes
  timeWindow: 15 * 60 * 1000, // 15 minutes
};

// Check if user/IP is blocked
export const checkLoginAttempts = async (identifier, ipAddress) => {
  try {
    const record = await LoginAttempt.findOne({ identifier, ipAddress });
    
    if (!record) {
      return { isBlocked: false, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts };
    }

    const now = new Date();
    
    // Check if block has expired
    if (record.isBlocked && record.blockedUntil && now > record.blockedUntil) {
      // Reset the record
      await LoginAttempt.updateOne(
        { identifier, ipAddress },
        {
          $set: {
            attempts: 0,
            isBlocked: false,
            blockedUntil: null,
            lastAttempt: now,
          },
        }
      );
      return { isBlocked: false, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts };
    }

    // Check if still blocked
    if (record.isBlocked) {
      const remainingTime = Math.ceil((record.blockedUntil - now) / 1000 / 60);
      return {
        isBlocked: true,
        remainingTime: remainingTime,
        message: `Account temporarily locked. Please try again in ${remainingTime} minutes.`,
      };
    }

    // Check if within time window and max attempts reached
    const timeSinceLastAttempt = now - record.lastAttempt;
    if (timeSinceLastAttempt < RATE_LIMIT_CONFIG.timeWindow && record.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
      // Block the user
      const blockedUntil = new Date(now.getTime() + RATE_LIMIT_CONFIG.blockDuration);
      await LoginAttempt.updateOne(
        { identifier, ipAddress },
        {
          $set: {
            isBlocked: true,
            blockedUntil: blockedUntil,
            lastAttempt: now,
          },
        }
      );
      
      const remainingTime = Math.ceil(RATE_LIMIT_CONFIG.blockDuration / 1000 / 60);
      return {
        isBlocked: true,
        remainingTime: remainingTime,
        message: `Too many failed attempts. Account locked for ${remainingTime} minutes.`,
      };
    }

    // Reset attempts if outside time window
    if (timeSinceLastAttempt >= RATE_LIMIT_CONFIG.timeWindow) {
      await LoginAttempt.updateOne(
        { identifier, ipAddress },
        {
          $set: {
            attempts: 0,
            lastAttempt: now,
          },
        }
      );
      return { isBlocked: false, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts };
    }

    const remainingAttempts = RATE_LIMIT_CONFIG.maxAttempts - record.attempts;
    return { isBlocked: false, remainingAttempts };
  } catch (error) {
    console.error('Error checking login attempts:', error);
    return { isBlocked: false, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts };
  }
};

// Record a failed login attempt
export const recordFailedAttempt = async (identifier, ipAddress) => {
  try {
    const now = new Date();
    const record = await LoginAttempt.findOne({ identifier, ipAddress });

    if (record) {
      // Increment attempts
      await LoginAttempt.updateOne(
        { identifier, ipAddress },
        {
          $inc: { attempts: 1 },
          $set: { lastAttempt: now },
        }
      );
    } else {
      // Create new record
      await LoginAttempt.create({
        identifier,
        ipAddress,
        attempts: 1,
        lastAttempt: now,
      });
    }
  } catch (error) {
    console.error('Error recording failed attempt:', error);
  }
};

// Clear login attempts on successful login
export const clearLoginAttempts = async (identifier, ipAddress) => {
  try {
    await LoginAttempt.deleteOne({ identifier, ipAddress });
  } catch (error) {
    console.error('Error clearing login attempts:', error);
  }
};

// Get login attempt statistics
export const getLoginAttemptStats = async (identifier, ipAddress) => {
  try {
    const record = await LoginAttempt.findOne({ identifier, ipAddress });
    return {
      attempts: record ? record.attempts : 0,
      lastAttempt: record ? record.lastAttempt : null,
      isBlocked: record ? record.isBlocked : false,
      blockedUntil: record ? record.blockedUntil : null,
    };
  } catch (error) {
    console.error('Error getting login attempt stats:', error);
    return { attempts: 0, lastAttempt: null, isBlocked: false, blockedUntil: null };
  }
};

export default LoginAttempt;
