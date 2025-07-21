# Email Configuration Setup

1. Enable 2-Step Verification in your Google Account:
   - Go to your Google Account settings
   - Click on "Security"
   - Enable "2-Step Verification" if not already enabled

2. Create an App Password:
   - Go to your Google Account settings
   - Click on "Security"
   - Under "Signing in to Google," select "App passwords"
   - Select "Mail" for the app and "Other" for the device
   - Click "Generate"
   - Save the 16-character password that appears

3. Add these environment variables to your .env file:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your.email@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_FROM=your.email@gmail.com
FRONTEND_URL=http://localhost:5173  # or your frontend URL
JWT_SECRET=your-jwt-secret         # must be same as your existing JWT_SECRET
```

Note: Replace the values with your actual Gmail address and the App Password you generated.

4. Test the email verification:
   - Sign up with a new account
   - Check your email for the verification link
   - Click the link to verify your email

Important Security Notes:
- Never commit your .env file to version control
- Keep your App Password secure
- Use different App Passwords for different applications
