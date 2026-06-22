import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendEmail } from "../service/mail.service.js";

const createToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const registerUser = async (req, res) => {
 
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, verified: false });

   
    const verificationToken = createToken(
      { userId: user._id }, 
      process.env.VERIFICATION_SECRET, 
      "1d" 
    );

    
    const verificationUrl = `http://localhost:3000/api/auth/verify?token=${verificationToken}`;

    // 3. Email bhejo jisme verification link shamil ho
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Anand Raj Hub - Verify Your Email",
        html: `
          <h3>Hi ${name},</h3>
          <p>Thank you for registering at Anand Raj Hub. We are excited to welcome you!</p>
          <p>Please click the link below to verify your email address and activate your account:</p>
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Verify Email</a>
          <br/><br/>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>Best regards,<br/>Anand Raj Hub Team</p>
        `,
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
      return res.status(500).json({
        message: "User registered, but the welcome email could not be sent.",
        error: err.message,
      });
    }

    // 4. Response bhejo
    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      user: { id: user._id, name: user.name, email: user.email, verified: user.verified },
      verificationToken,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  // FIX: Look for 'token' instead of 'authToken' to match your verificationUrl (?token=...)
  const token = 
    req.query.token || 
    req.body.token || 
    (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(400).json({ message: "Verification token is required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.VERIFICATION_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    user.verified = true;
    await user.save();

    const authToken = createToken(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      "7d"
    );

    res.json({ 
      message: "User verified successfully.", 
      token: authToken, 
      user: { id: user._id, name: user.name, email: user.email, verified: user.verified } 
    });
  } catch (error) {
    // Helpful trick: Log the actual error to your terminal so you can see if it's expired vs malicious
    console.error("JWT Verification Error:", error.message);
    res.status(400).json({ message: "Invalid or expired verification token." });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.verified) {
      const verificationToken = createToken(
      { userId: user._id }, 
      process.env.VERIFICATION_SECRET, 
      "1d" 
    );

    
    const verificationUrl = `http://localhost:3000/api/auth/verify?token=${verificationToken}`;

    // 3. Email bhejo jisme verification link shamil ho
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Anand Raj Hub - Verify Your Email",
        html: `
         
          <p>Thank you for registering at Anand Raj Hub. We are excited to welcome you!</p>
          <p>Please click the link below to verify your email address and activate your account:</p>
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Verify Email</a>
          <br/><br/>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>Best regards,<br/>Anand Raj Hub Team</p>
        `,
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
      return res.status(500).json({
        message: "User registered, but the welcome email could not be sent.",
        error: err.message,
      });
    }
    
      return res.status(403).json({ message: "Account not verified. Please verify before logging in." });
    }

    const authToken = createToken(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      "7d"
    );
res.cookie("authToken", authToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
    res.json({ token: authToken, user: { id: user._id, name: user.name, email: user.email, verified: user.verified } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getme = async(req,res)=>{
try{
const user = req.user
res.status(200).json({
  user
})

}
catch(err){
return res.status(500).json({
  message : "internal server error"
})
}
  
}   



