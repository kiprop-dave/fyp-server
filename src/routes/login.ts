import { Router } from "express";
import { createAdmin, authAdmin } from "../controllers/adminController";
const router = Router();

// Will use to create one admin
// It is only used during development
// router.route("/signup").post(createAdmin);

// Will use to login admin
router.route("/login").post(authAdmin);

export default router;
