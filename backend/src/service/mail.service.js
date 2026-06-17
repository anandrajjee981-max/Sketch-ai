import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email server auth failed:", error.message);
  } 
});

export const sendEmail = async ({ to, subject, html, text = "" }) => {
  const mailOptions = {
    from: process.env.GOOGLE_USER, // Proper format for sender
    to,
        subject,
        html,
        text
  };

  return transporter.sendMail(mailOptions);
};