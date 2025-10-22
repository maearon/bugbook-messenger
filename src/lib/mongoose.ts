import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define the MONGODB_URI environment variable in .env.local");
}

// Định nghĩa type cho globalThis (để tránh dùng any)
declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

// Khởi tạo cache toàn cục (chỉ tạo một lần)
const cached = global.mongooseGlobal ?? {
  conn: null,
  promise: null,
};
global.mongooseGlobal = cached;

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI || "mongodb+srv://manhng132:%23q%2Ae%259Fb%267PfR%24%3F@cluster0.k4f3r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
        dbName: "prod",
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("✅ Connected to MongoDB");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
