// A controller to create and authenticate an admin
import { Request, Response } from "express";
import AdminModel from "../models/Admin";
import { AdminSchema } from "../types/types";
import jwt from "jsonwebtoken";
import { generateHashedPassword, compare } from "../utils/password";
import { z } from "zod";

// Create an admin
async function createAdmin(req: Request, res: Response) {
  if (!req.body.name || !req.body.email || !req.body.password) {
    res
      .status(400)
      .send({ message: "Please provide a name, email and password" });
    return;
  }

  try {
    const { name, email, password } = req.body;

    // Check if details pass validation
    const admin = AdminSchema.parse({ name, email, password });

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

// Authenticate an admin
async function authAdmin(req: Request, res: Response) {
  if (!req.body.email || !req.body.password) {
    res.status(400).send({ message: "Please provide an email and password" });
    return;
  }

  try {
    const { email, password } = req.body;

    const foundAdmin = await AdminModel.findOne({ email: email }).exec();
    if (!foundAdmin) {
      return res
        .status(401)
        .send({ message: "There is no admin with that email" });
    }

    const isPasswordCorrect = compare(foundAdmin.password, password);
    if (!isPasswordCorrect) {
      return res.status(401).send({ message: "Incorrect password" });
    }

    const accessSecret = process.env.ACCESS_SECRET;
    if (!accessSecret) {
      return res.status(500).send({ message: "Something went wrong" });
    }

    const token = jwt.sign({ email: foundAdmin.email }, accessSecret, {
      expiresIn: "1h",
    });

    const mqttUsername = process.env.MQTT_USERNAME;
    const mqttPassword = process.env.MQTT_PASSWORD;
    const brokerUrl = process.env.BROKER_URL;

    if (!mqttUsername || !mqttPassword || !brokerUrl) {
      return res.status(500).send({ message: "Something went wrong" });
    }

    return res
      .status(200)
      .send({ token, mqttUsername, mqttPassword, brokerUrl });
  } catch (error) {
    return res.status(500).send({ message: "Something went wrong" });
  }
}

export { createAdmin, authAdmin };
