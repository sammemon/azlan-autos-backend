const nodemailer = require('nodemailer');

// Create a transporter from environment or log a helpful error
function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email credentials are missing. Set EMAIL_USER and EMAIL_PASSWORD in environment.');
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

function buildVerificationLink(token, req) {
  // Prefer explicit frontend URL for deep-linking, otherwise fall back to backend URL
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    // Pass token as query so the client can route to verification screen
    return `${frontendUrl.replace(/\/$/, '')}/verify?token=${token}`;
  }

  const host = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
  return `${host}/api/auth/verify-email/${token}`;
}

async function sendVerificationEmail(email, token, req) {
  const transporter = createTransporter();
  const verificationLink = buildVerificationLink(token, req);

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your email - Easy Invoice POS',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 16px; color: #111827;">
        <h2 style="color: #111827;">Welcome to Easy Invoice POS</h2>
        <p>Please verify your email to activate your account.</p>
        <p><strong>Verification token:</strong></p>
        <p style="font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">${token}</p>
        <p>You can also click the button below:</p>
        <p>
          <a href="${verificationLink}" style="background: #2563EB; color: #fff; padding: 12px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
        </p>
        <p style="color: #4B5563;">This link expires in 24 hours.</p>
        <p style="color: #6B7280; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
