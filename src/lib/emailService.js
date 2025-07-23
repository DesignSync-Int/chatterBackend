import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async user => {
  try {
    console.log("sendVerificationEmail called with user:", {
      _id: user._id,
      email: user.email,
      name: user.name,
    });

    // Check if email configuration is available
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.error("Email configuration missing");
      return false;
    }

    if (!user.email) {
      console.error("User email is missing");
      return false;
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Chatter!</h2>
          <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
          <p style="color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
        </div>
      `,
    };

    console.log("Sending email to:", user.email);
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email send failed:", error.message);
    return false;
  }
};
export const sendResetVerificationEmail = async user => {
  try {
    console.log("sendVerificationEmail called with user:", {
      _id: user._id,
      email: user.email,
      name: user.name,
    });

    // Check if email configuration is available
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.error("Email configuration missing");
      return false;
    }

    if (!user.email) {
      console.error("User email is missing");
      return false;
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/#/reset-password?token=${verificationToken}`;
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "reset your password",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>We received a request to reset your password for your Chatter account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
            style="background-color: #FB406C; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #FB406C;">${resetUrl}</a>
        </p>
      </div>
      `,
    };
    console.log("Sending email to:", user.email);
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email send failed:", error.message);
    return false;
  }
};
