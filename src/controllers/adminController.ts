// A controller to create and authenticate an admin
import { Request, Response } from "express";
import AdminModel from "../models/Admin";
import { Admin } from "../types/types";
import jwt from "jsonwebtoken";
import { generateHashedPassword, compare } from "../utils/password";
// Not yet complete!! TODO: Finish this controller

// Create an admin
async function createAdmin(req: Request, res: Response) {
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.status(400).send("Please provide a name, email and password");
    return;
  }
  const hashedPassword = generateHashedPassword(req.body.password);
  const newAdmin = new AdminModel({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  await newAdmin.save();
  return res.status(201).send("Admin created");
}

// Authenticate an admin
async function authAdmin(req: Request, res: Response) {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please provide an email and password");
    return;
  }

  try {
    const { email, password } = req.body;

    const foundAdmin = await AdminModel.findOne({ email: email }).exec();
    if (!foundAdmin) {
      return res.status(401).send("Invalid credentials");
    }

    const isPasswordCorrect = compare(foundAdmin.password, password);
    if (!isPasswordCorrect) {
      return res.status(401).send("Invalid credentials");
    }

    const accessSecret = process.env.ACCESS_SECRET;
    if (!accessSecret) {
      return res.status(500).send("Something went wrong");
    }

    const token = jwt.sign({ email: foundAdmin.email }, accessSecret, {
      expiresIn: "1h",
    });
    return res.status(200).send({ token });
  } catch (error) {
    return res.status(500).send("Something went wrong");
  }
}

export { createAdmin, authAdmin };
