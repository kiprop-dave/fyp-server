import { Schema, model } from "mongoose";
import { Admin } from "../types/types";

const AdminSchema = new Schema<Admin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
});

const AdminModel = model<Admin>("Admin", AdminSchema);

export default AdminModel;
