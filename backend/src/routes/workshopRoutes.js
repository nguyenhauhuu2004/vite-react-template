import express from "express";

import {
  createWorkshop,
  deleteMediaController,
  getGoongPlaceDetail,
  getWorkshopById,
  reverseGoongGeocode,
  searchGoongPlaces,
  updateWorkshop,
  uploadWorkshopMediaController,
  getNearbyWorkshops,
  getWorkshops,
} from "../controllers/workshopController.js";

import { protectedRoute } from "../middlewares/authMiddleware.js";
import { workshopUpload } from "../middlewares/workshopUploadMiddleware.js";

const router = express.Router();

router.get("/goong/autocomplete", searchGoongPlaces);
router.get("/goong/place-detail", getGoongPlaceDetail);
router.get("/goong/reverse-geocode", reverseGoongGeocode);

router.post(
  "/upload-media",
  protectedRoute,
  workshopUpload.array("files", 10),
  uploadWorkshopMediaController,
);

router.delete("/media", protectedRoute, deleteMediaController);
router.get("/", getWorkshops);

router.post("/", protectedRoute, createWorkshop);

router.patch("/:id", protectedRoute, updateWorkshop);

router.get("/:id", getWorkshopById);

export default router;

router.get("/nearby", getNearbyWorkshops);
