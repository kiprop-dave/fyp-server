import { Router } from "express";
import verifyJwt from "../../middleware/verifyJwt";
import {
  getDayReadings,
  getWeekReadings,
} from "../../controllers/readingsController";

const router = Router();
router.route("/day").get(verifyJwt, getDayReadings);
router.route("/week").get(verifyJwt, getWeekReadings);

export default router;
