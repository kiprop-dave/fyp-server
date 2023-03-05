import { Router } from "express";
import verifyJwt from "../../middleware/verifyJwt";
import { getDayReadings } from "../../controllers/readingsController";

const router = Router();

router.use(verifyJwt);

router.route("/").get(verifyJwt, getDayReadings);

export default router;
