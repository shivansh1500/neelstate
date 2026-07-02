import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://i.pinimg.com/736x/a7/31/d1/a731d1ac78efdeb68872580f57540070.jpg",
    },
    // Array of purchased listing IDs
    purchasedListings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    }],
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;