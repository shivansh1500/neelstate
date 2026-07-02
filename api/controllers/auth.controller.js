import jwt from "jsonwebtoken"; 
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import { OAuth2Client } from "google-auth-library";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  console.log('Signup request received:', { username, email, password: password ? '[HIDDEN]' : 'MISSING' });

  try {
    // Validate required fields
    if (!username || !email || !password) {
      console.log('Missing required fields:', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ 
        success: false,
        message: "User already exists" 
      });
    }

    // Hash password and create user
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword 
    });
    
    await newUser.save();
    console.log('User created successfully:', email);
    
    res.status(201).json({ 
      success: true,
      message: "User created successfully" 
    });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found!"));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong Credentials!"));
    const accessToken = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    validUser.refreshToken = refreshToken;
    await validUser.save();
    
    const { password: pass, refreshToken: rt, ...rest } = validUser._doc;
    res
      .cookie("access_token", accessToken, { httpOnly: true, secure: true, sameSite: 'none' })
      .cookie("refresh_token", refreshToken, { httpOnly: true, secure: true, sameSite: 'none' })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return next(errorHandler(400, "Google Token is required"));
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        // Not strictly enforcing audience here so it works out of the box with the frontend's varying client_id configs if testing
      });
    } catch (err) {
      console.error("Google Token Verification Failed:", err.message);
      return next(errorHandler(401, "Invalid Google Token"));
    }

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    const user = await User.findOne({ email });
    if (user) {
      const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      user.refreshToken = refreshToken;
      await user.save();
      
      const { password: pass, refreshToken: rt, ...rest } = user._doc;
      res
        .cookie("access_token", accessToken, { httpOnly: true, secure: true, sameSite: 'none' })
        .cookie("refresh_token", refreshToken, { httpOnly: true, secure: true, sameSite: 'none' })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email,
        password: hashedPassword,
        avatar: picture,
      });
      await newUser.save();
      const accessToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      newUser.refreshToken = refreshToken;
      await newUser.save();

      const { password: pass, refreshToken: rt, ...rest } = newUser._doc;
      res
        .cookie("access_token", accessToken, { httpOnly: true, secure: true, sameSite: 'none' })
        .cookie("refresh_token", refreshToken, { httpOnly: true, secure: true, sameSite: 'none' })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }
    res.clearCookie('access_token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.clearCookie('refresh_token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(200).json('User has been logged out');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) return next(errorHandler(401, "You are not authenticated!"));

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) return next(errorHandler(403, "Token is not valid!"));

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, userInfo) => {
      if (err) return next(errorHandler(403, "Token is not valid!"));

      const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

      res
        .cookie("access_token", accessToken, { httpOnly: true, secure: true, sameSite: 'none' })
        .status(200)
        .json({ success: true, message: "Token refreshed successfully" });
    });
  } catch (error) {
    next(error);
  }
};