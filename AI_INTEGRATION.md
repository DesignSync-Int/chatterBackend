# Chatter AI Integration with Google Gemini

## Overview

Chatter now includes an intelligent AI chatbot powered by Google Gemini AI, designed to enhance user experience for guest users and provide automated conversation partners.

## Features

### 🤖 AI Chatbot (ChatterBot)

- **Intelligent Responses**: Powered by Google Gemini AI with context-aware conversations
- **Fallback System**: Smart fallback responses when API is unavailable
- **Guest Integration**: Automatically available for guest users
- **Real-time**: Seamless integration with Socket.IO messaging system

### 🧠 AI Capabilities

- Context-aware conversations
- Natural language understanding
- Emotional support and encouragement
- Topic suggestions and conversation starters
- Appropriate content filtering

## Setup

### 1. Google Gemini API Key (Optional)

To enable full AI functionality:

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a free API key
3. Add to your `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

**Note**: The system works without an API key using intelligent fallback responses.

### 2. Backend Setup

The AI system is automatically initialized when the server starts:

```bash
cd chatterBackend
npm install
npm start
```

### 3. Frontend Setup

```bash
cd chatterFrontend
npm install
npm run dev
```

## Usage

### For Guest Users

1. Click "Continue as Guest (Testing)" on the login page
2. ChatterBot automatically appears in your friend list
3. Start chatting immediately with the AI

### For Regular Users

- ChatterBot is available in the user directory
- Send a friend request to start chatting

## API Endpoints

### AI Bot Information

```http
GET /api/ai/bot
```

Returns ChatterBot user information.

### Send Message to AI

```http
POST /api/ai/message
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Hello, how are you?"
}
```

### Test AI System

```http
GET /api/ai/test
```

Tests AI response generation.

## Technical Implementation

### Backend Components

- **AI Controller** (`src/controllers/ai.controller.js`): Core AI logic
- **AI Routes** (`src/routes/ai.route.js`): API endpoints
- **Message Integration**: Auto-response system in message controller
- **User Model**: Support for AI bot users

### Frontend Integration

- Guest login automatically connects to ChatterBot
- Real-time messaging with AI responses
- Seamless UI integration

## AI Response System

### Google Gemini Integration

When API key is available:

- Full Google Gemini AI responses
- Context-aware conversations
- Advanced natural language processing

### Fallback System

When API is unavailable:

- Intelligent pattern matching
- Context-appropriate responses
- Conversation starters and suggestions

## Security & Privacy

- No personal data stored in AI conversations
- Rate limiting on AI requests
- Content filtering for appropriate responses
- Guest session data is temporary

## Development Notes

### Adding New AI Features

1. Extend `ai.controller.js` with new functions
2. Add corresponding routes in `ai.route.js`
3. Update frontend components as needed

### Customizing Responses

Modify the fallback responses in `ai.controller.js`:

```javascript
const fallbackResponses = [
  // Add your custom responses here
];
```

## Troubleshooting

### Common Issues

1. **AI not responding**: Check if ChatterBot user exists in database
2. **Slow responses**: API rate limits or network issues
3. **Missing messages**: Verify Socket.IO connection

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

## Future Enhancements

- [ ] Multiple AI personality options
- [ ] Voice message support
- [ ] Advanced conversation memory
- [ ] Multi-language support
- [ ] Custom AI training on conversation data

## Support

For issues or questions about the AI integration, check:

1. Server logs for AI initialization messages
2. Network tab for API request failures
3. Console for Socket.IO connection status

---

**Status**: ✅ Fully Implemented
**AI Provider**: Google Gemini (with fallback system)
**Real-time**: Socket.IO integrated
**Guest Ready**: Automatic connection for guest users
