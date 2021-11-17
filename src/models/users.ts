import Mongoose, { Schema } from "mongoose";
import IUsers from "../types/users";

const UserSchema: Schema = new Schema(
  {
    id: { type: Buffer, required: true },
    emailAddress: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default Mongoose.model<IUsers>("Users", UserSchema);
