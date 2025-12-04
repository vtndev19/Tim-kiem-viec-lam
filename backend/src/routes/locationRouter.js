import express from "express";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "../controller/locationController.js";

const router = express.Router();

router.get("/provinces", getProvinces);
router.get("/districts/:code", getDistricts);
router.get("/wards/:code", getWards);

export default router;
