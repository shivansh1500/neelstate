import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from './routes/user.route.js'
import cors from "cors"
import authRouter from './routes/auth.route.js'
import cookieParser from "cookie-parser";
import listingRouter from "./routes/listing.route.js";
import uploadRouter from "./routes/upload.route.js";
import messageRouter from "./routes/message.route.js";
import notificationRouter from "./routes/notification.route.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

const app = express();

// Configure CORS with multiple origins for development and production
const allowedOrigins = [
  process.env.CLIENT_URL || "https://neelstate.onrender.com",
  "http://localhost:5173", // For local development
  "http://localhost:3000"  // For local development
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json()); // this is used to get printed data on console from post request
app.use(cookieParser());

const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on("register", (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} registered with socket ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  next();
});

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error(err);
  });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/messages", messageRouter);
app.use("/api/notifications", notificationRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "NeelState API is running",
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'internal server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message,
  });
  
});