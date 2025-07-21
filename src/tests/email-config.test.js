import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const testEmailConfig = async () => {
  // Create test account if no SMTP credentials
  const testAccount = !process.env.SMTP_USER ? await nodemailer.createTestAccount() : null;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || testAccount?.user,
      pass: process.env.SMTP_PASS || testAccount?.pass,
    },
  });

  try {
    // Send test email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Test User" <test@example.com>',
      to: process.env.SMTP_USER || testAccount?.user,
      subject: 'Test Email ✔',
      text: 'If you can see this, your email configuration is working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FB406C;">Email Configuration Test</h2>
          <p>If you can see this, your email configuration is working correctly! 🎉</p>
          <p>You can now use the email verification system in your application.</p>
        </div>
      `,
    });

    console.log('Test email sent successfully!');
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    process.exit(0);
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
};

testEmailConfig();
