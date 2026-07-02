import express from "express";
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
  buyListing,
  acceptBuyRequest,
  declineBuyRequest,
} from "../controllers/listing.controller.js";
import verifyToken from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, createListing);
router.delete("/delete/:id", verifyToken, deleteListing);
router.post("/update/:id", verifyToken, updateListing);
router.post("/buy/:id", verifyToken, buyListing);
router.post("/accept-buy/:id/:buyerId", verifyToken, acceptBuyRequest);
router.post("/decline-buy/:id/:buyerId", verifyToken, declineBuyRequest);
router.get("/get/:id", getListing);
router.get("/get", getListings);

export default router;
