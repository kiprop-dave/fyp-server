import { Router } from "express";
import { createAdmin, authAdmin } from "../controllers/adminController";
const router = Router();

router.route("/").post();

// Will use to create one admin
router.route("/signup").post();

// Will use to login admin
router.route("/login").post();

export default router;
