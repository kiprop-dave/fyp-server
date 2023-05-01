// A controller to create and authenticate an admin
import { Request, Response } from "express";
import AdminModel from "../models/Admin";
import { AdminSchema, loginSchema } from "../types/types";
import jwt from "jsonwebtoken";
import { generateHashedPassword, compare } from "../utils/password";
import { z } from "zod";
import env from "../env";

// Create an admin
async function createAdmin(req: Request, res: Response) {
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.status(400).send({ message: "Please provide a name, email and password" });
    return;
  }

  try {
    // Check if details pass validation
    const admin = AdminSchema.parse(req.body);

    // Check if admin already exists
    let conflict = await AdminModel.findOne({ email: admin.email }).exec();
    if (conflict) {
      return res.status(409).send({ message: "Admin already exists" });
    }

    const hashedPassword = generateHashedPassword(admin.password);
    const newAdmin = new AdminModel({
      name: admin.name,
      email: admin.email,
      password: hashedPassword,
    });
    await newAdmin.save();
    return res.status(201).send("Admin created");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).send({ message: "Invalid details" });
    }
  }
}

/*
 *A controller to authenticate an admin
 *The admin will be authenticated using email and password
 *If the admin is authenticated, a JWT token will be generated
 *The token will be used to access protected routes
 *The admin will also be given the MQTT username, password and broker URL
 */
async function authAdmin(req: Request, res: Response) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: "Please provide an email and password" });
  }

  try {
    const admin = loginSchema.parse(req.body);

    const foundAdmin = await AdminModel.findOne({ email: admin.email }).exec();
    if (!foundAdmin) {
      return res.status(401).send({ message: "You are not a registered user" });
    }

    const isPasswordCorrect = compare(foundAdmin.password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).send({ message: "Incorrect email or password" });
    }

    const accessSecret = env.ACCESS_SECRET;

    const token = jwt.sign({ email: foundAdmin.email }, accessSecret, {
      expiresIn: "1h",
    });

    const mqttUsername = env.MQTT_USERNAME;
    const mqttPassword = env.MQTT_PASSWORD;
    const brokerUrl = env.BROKER_URL;

    return res.status(200).send({ token, mqttUsername, mqttPassword, brokerUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).send({ message: "Invalid details" });
    }
    return res.status(500).send({ message: "Something went wrong" });
  }
}

export { createAdmin, authAdmin };
