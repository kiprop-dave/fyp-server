import { Router } from "express";
import verifyJwt from "../../middleware/verifyJwt";
import { getReadings } from "../../controllers/readingsController";

const router = Router();

router.route("/").get(verifyJwt, getReadings);

export default router;
