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

// 🛠️ TEMPORARY COMMENT OUT: Isko band karo jab tak API key thik na ho
// transporter.verify((error, success) => {
//   if (error) {
//     console.log("❌ Email server auth failed:", error.message);
//   } 
// });

export const sendEmail = async ({ to, subject, html, text = "" }) => {
  // Safe validation check: Agar API expired hai toh function yahi se return ho jaye, server crash na kare
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    console.log("⚠️ Email skipped: Token expired/missing");
    return null;
  }
  
  const mailOptions = {
    from: process.env.GOOGLE_USER,
    to,
    subject,
    html,
    text
  };

  return transporter.sendMail(mailOptions);
};