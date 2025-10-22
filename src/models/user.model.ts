import mongoose, { Document, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { toJSON, paginate } from "./plugins";
import { roles } from "../config/roles";

// ----------------------
// 1️⃣ Interfaces
// ----------------------
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
}

// ----------------------
// 2️⃣ Schema Definition
// ----------------------
const userSchema = new mongoose.Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error("Password must contain at least one letter and one number");
        }
      },
    },
    role: {
      type: String,
      enum: roles,
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ----------------------
// 3️⃣ Plugins
// ----------------------
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

// ----------------------
// 4️⃣ Static methods
// ----------------------
userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: mongoose.Types.ObjectId
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

// ----------------------
// 5️⃣ Instance methods
// ----------------------
userSchema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(password, user.password);
};

// ----------------------
// 6️⃣ Middleware (Hooks)
// ----------------------
userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// ----------------------
// 7️⃣ Model export
// ----------------------
const User = mongoose.models.User || mongoose.model<IUser, IUserModel>("User", userSchema);
export default User;
