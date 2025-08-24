import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock dependencies using ES module syntax
const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

const mockMessageModel = {
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
};

const mockHash = jest.fn();

// Mock modules
jest.unstable_mockModule("../../src/models/user.model.js", () => ({
  default: mockUserModel,
}));

jest.unstable_mockModule("../../src/models/message.model.js", () => ({
  default: mockMessageModel,
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: mockHash,
  },
}));

// Import after mocking
const { sendWelcomeMessage, createAIBot } = await import(
  "../../src/controllers/ai.controller.js"
);

describe("AI Controller - Welcome Message System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHash.mockResolvedValue("hashedpassword");
  });

  describe("sendWelcomeMessage", () => {
    const mockUser = {
      _id: "user123",
      name: "testuser",
      fullName: "Test User",
      email: "test@example.com",
    };

    const mockAIBot = {
      _id: "aibot123",
      name: "ChatterBot",
      fullName: "ChatterBot - Chatter AI Assistant (Powered by Google Gemini)",
      isAIBot: true,
    };

    it("should send personalized welcome message to new user", async () => {
      // Mock database operations
      mockUserModel.findOne.mockResolvedValue(mockAIBot);
      mockUserModel.findById.mockResolvedValue(mockUser);

      const mockMessage = { save: jest.fn().mockResolvedValue(true) };
      mockMessageModel.create = jest.fn().mockResolvedValue(mockMessage);

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result = await sendWelcomeMessage(mockUser._id);

      // Verify AI bot lookup
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        name: "ChatterBot",
      });

      // Verify user lookup
      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUser._id);

      // Verify message creation
      expect(mockMessageModel.create).toHaveBeenCalledWith({
        senderId: mockAIBot._id,
        receiverId: mockUser._id,
        message: expect.stringContaining(mockUser.fullName),
        timestamp: expect.any(Date),
      });

      // Verify message was saved
      expect(mockMessage.save).toHaveBeenCalled();

      // Verify success logging
      expect(consoleSpy).toHaveBeenCalledWith(
        `🤖 Welcome message sent to user ${mockUser.name}`
      );

      expect(result).toBe(true);
      consoleSpy.mockRestore();
    });

    it("should include comprehensive welcome content", async () => {
      User.findOne.mockResolvedValue(mockAIBot);
      User.findById.mockResolvedValue(mockUser);

      const mockMessage = { save: jest.fn().mockResolvedValue(true) };
      Message.mockImplementation(() => mockMessage);

      await sendWelcomeMessage(mockUser._id);

      const messageCall = Message.mock.calls[0][0];
      const welcomeMessage = messageCall.message;

      // Verify personalization
      expect(welcomeMessage).toContain(
        `Welcome to Chatter, ${mockUser.fullName}!`
      );

      // Verify ChatterBot introduction
      expect(welcomeMessage).toContain("I'm ChatterBot");
      expect(welcomeMessage).toContain("Google Gemini");

      // Verify feature highlights
      expect(welcomeMessage).toContain("Real-time messaging with Socket.IO");
      expect(welcomeMessage).toContain("Smart notifications");
      expect(welcomeMessage).toContain("React & TypeScript");
      expect(welcomeMessage).toContain("AI-powered conversations");
      expect(welcomeMessage).toContain("Guest access");
      expect(welcomeMessage).toContain("CAPTCHA protection");

      // Verify creator attribution
      expect(welcomeMessage).toContain("Created by Sachin Kumar");
      expect(welcomeMessage).toContain("passionate developer");

      // Verify help information
      expect(welcomeMessage).toContain("Need help?");
      expect(welcomeMessage).toContain("How to use Chatter features");
      expect(welcomeMessage).toContain("Technical details");
      expect(welcomeMessage).toContain("Finding friends");
      expect(welcomeMessage).toContain("Customizing your profile");

      // Verify call to action
      expect(welcomeMessage).toContain("Ready to explore?");
      expect(welcomeMessage).toContain("What would you like to know first?");
      expect(welcomeMessage).toContain('Type "help" anytime');
    });

    it("should handle user with only name (no fullName)", async () => {
      const userWithoutFullName = {
        _id: "user456",
        name: "simpleuser",
        fullName: null,
        email: "simple@example.com",
      };

      User.findOne.mockResolvedValue(mockAIBot);
      User.findById.mockResolvedValue(userWithoutFullName);

      const mockMessage = { save: jest.fn().mockResolvedValue(true) };
      Message.mockImplementation(() => mockMessage);

      await sendWelcomeMessage(userWithoutFullName._id);

      const messageCall = Message.mock.calls[0][0];
      const welcomeMessage = messageCall.message;

      // Should use name when fullName is not available
      expect(welcomeMessage).toContain(
        `Welcome to Chatter, ${userWithoutFullName.name}!`
      );
    });

    it("should return false when AI bot cannot be created", async () => {
      User.findOne.mockResolvedValue(null); // No existing bot
      User.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error("DB Error")),
      }));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await sendWelcomeMessage(mockUser._id);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Could not create AI bot for welcome message"
      );

      consoleSpy.mockRestore();
    });

    it("should return false when user is not found", async () => {
      User.findOne.mockResolvedValue(mockAIBot);
      User.findById.mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await sendWelcomeMessage("nonexistent-user");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "User not found for welcome message"
      );

      consoleSpy.mockRestore();
    });

    it("should return false when message save fails", async () => {
      User.findOne.mockResolvedValue(mockAIBot);
      User.findById.mockResolvedValue(mockUser);

      const mockMessage = {
        save: jest.fn().mockRejectedValue(new Error("Save failed")),
      };
      Message.mockImplementation(() => mockMessage);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await sendWelcomeMessage(mockUser._id);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error sending welcome message:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("createAIBot", () => {
    it("should create AI bot if it does not exist", async () => {
      User.findOne.mockResolvedValue(null); // Bot doesn't exist

      const mockBot = {
        save: jest.fn().mockResolvedValue(true),
        _id: "newbot123",
        name: "ChatterBot",
      };
      User.mockImplementation(() => mockBot);

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result = await createAIBot();

      // Verify bot lookup
      expect(User.findOne).toHaveBeenCalledWith({ name: "ChatterBot" });

      // Verify bot creation
      expect(User).toHaveBeenCalledWith({
        name: "ChatterBot",
        fullName:
          "ChatterBot - Chatter AI Assistant (Powered by Google Gemini)",
        email: "chatterbot@chatter.local",
        password: "hashedpassword",
        profile: "/avatar-demo.html",
        isGuest: false,
        isAIBot: true,
      });

      // Verify bot was saved
      expect(mockBot.save).toHaveBeenCalled();

      // Verify success logging
      expect(consoleSpy).toHaveBeenCalledWith(
        "🤖 AI Bot user created successfully with Gemini AI integration"
      );

      expect(result).toBe(mockBot);
      consoleSpy.mockRestore();
    });

    it("should return existing AI bot if it already exists", async () => {
      const existingBot = {
        _id: "existingbot123",
        name: "ChatterBot",
        isAIBot: true,
      };

      User.findOne.mockResolvedValue(existingBot);

      const result = await createAIBot();

      // Verify only lookup was performed
      expect(User.findOne).toHaveBeenCalledWith({ name: "ChatterBot" });
      expect(User).not.toHaveBeenCalled(); // No new bot created

      expect(result).toBe(existingBot);
    });

    it("should handle bot creation errors gracefully", async () => {
      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error("Creation failed")),
      }));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await createAIBot();

      expect(result).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error creating AI bot:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Welcome Message Content Quality", () => {
    it("should maintain professional tone for business users", async () => {
      const businessUser = {
        _id: "biz123",
        name: "ceo",
        fullName: "CEO Johnson",
        email: "ceo@company.com",
      };

      User.findOne.mockResolvedValue(mockAIBot);
      User.findById.mockResolvedValue(businessUser);

      const mockMessage = { save: jest.fn().mockResolvedValue(true) };
      Message.mockImplementation(() => mockMessage);

      await sendWelcomeMessage(businessUser._id);

      const messageCall = Message.mock.calls[0][0];
      const welcomeMessage = messageCall.message;

      // Should maintain professional tone
      expect(welcomeMessage).toContain("cutting-edge");
      expect(welcomeMessage).toContain("modern technology");
      expect(welcomeMessage).toContain("passionate developer");
      expect(welcomeMessage).toContain("showcase");
      expect(welcomeMessage).not.toContain("awesome");
      expect(welcomeMessage).not.toContain("cool");
    });

    it("should highlight technical achievements", async () => {
      User.findOne.mockResolvedValue(mockAIBot);
      User.findById.mockResolvedValue(mockUser);

      const mockMessage = { save: jest.fn().mockResolvedValue(true) };
      Message.mockImplementation(() => mockMessage);

      await sendWelcomeMessage(mockUser._id);

      const messageCall = Message.mock.calls[0][0];
      const welcomeMessage = messageCall.message;

      // Should showcase technical stack
      const technicalTerms = [
        "Socket.IO",
        "React",
        "TypeScript",
        "Google Gemini",
        "CAPTCHA",
        "AI-powered",
        "real-time messaging",
        "smart notifications",
      ];

      technicalTerms.forEach((term) => {
        expect(welcomeMessage).toContain(term);
      });
    });

    it("should provide clear next steps", async () => {
      User.findOne.mockResolvedValue(mockAIBot);
      User.findById.mockResolvedValue(mockUser);

      const mockMessage = { save: jest.fn().mockResolvedValue(true) };
      Message.mockImplementation(() => mockMessage);

      await sendWelcomeMessage(mockUser._id);

      const messageCall = Message.mock.calls[0][0];
      const welcomeMessage = messageCall.message;

      // Should provide actionable guidance
      expect(welcomeMessage).toContain("Ready to explore?");
      expect(welcomeMessage).toContain("What would you like to know first?");
      expect(welcomeMessage).toContain('Type "help"');
      expect(welcomeMessage).toContain("How to use Chatter features");
    });
  });
});
