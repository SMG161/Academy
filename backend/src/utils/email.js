const { Resend } = require('resend');

let resendClient = null;

function getClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

async function sendEmail({ to, subject, html }) {
  const client = getClient();
  const from = process.env.EMAIL_FROM || 'EduBeacon <onboarding@resend.dev>';

  const { error } = await client.emails.send({ from, to, subject, html });

  if (error) {
    throw new Error(error.message || 'Failed to send email');
  }
}

async function sendVerificationEmail(to, name, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await sendEmail({
    to,
    subject: 'Verify your EduBeacon email',
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for signing up for EduBeacon. Please verify your email address to activate your account.</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    `,
  });
}

async function sendPasswordResetEmail(to, name, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to,
    subject: 'Reset your EduBeacon password',
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your EduBeacon password.</p>
      <p><a href="${resetUrl}">Reset my password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

async function sendTeacherInviteEmail(to, name, token) {
  const setPasswordUrl = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

  await sendEmail({
    to,
    subject: "You've been invited to teach on EduBeacon",
    html: `
      <p>Hi ${name},</p>
      <p>An admin has created a teacher account for you on EduBeacon.</p>
      <p>Set your password to activate your account and start managing courses:</p>
      <p><a href="${setPasswordUrl}">Set my password</a></p>
      <p>This link expires in 7 days. If you weren't expecting this, you can ignore this email.</p>
    `,
  });
}

async function sendOtpEmail(to, name, code) {
  console.log(`[OTP] Login code for ${to}: ${code}`);

  await sendEmail({
    to,
    subject: `${code} is your EduBeacon login code`,
    html: `
      <p>Hi ${name},</p>
      <p>Your EduBeacon login code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  sendTeacherInviteEmail,
};
