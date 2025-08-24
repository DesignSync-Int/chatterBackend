// Test setup file for Jest
import { jest } from "@jest/globals";

// Global test configuration
process.env.NODE_ENV = "test";

// Mock environment variables for tests
process.env.JWT_SECRET = "test-jwt-secret";
process.env.GEMINI_API_KEY = "test-gemini-key";
process.env.SMTP_HOST = "smtp.test.com";
process.env.SMTP_USER = "test@test.com";
process.env.SMTP_PASS = "testpass";
process.env.SMTP_FROM = "Chatter <noreply@test.com>";
process.env.FRONTEND_URL = "http://localhost:5173";

// Global console mock to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
