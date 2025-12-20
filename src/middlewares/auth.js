import { NextResponse } from 'next/server';
import httpStatus from 'http-status';
import ApiError from '@/utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongoose';
import User from '@/models/user.model';

export async function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }

  const token = authHeader.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token invalid or expired');
  }

  await connectToDatabase();

  const user = await User.findById(payload.userId || payload.sub);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
  }

  return user;
}

export function withAuth(handler) {
  return async (req) => {
    try {
      const user = await verifyAuth(req);
      req.user = user;
      return await handler(req, user);
    } catch (err) {
      return NextResponse.json(
        { message: err.message || 'Authentication failed' },
        { status: err.statusCode || httpStatus.UNAUTHORIZED },
      );
    }
  };
}

// import { NextResponse } from "next/server";
// import httpStatus from "http-status";
// import ApiError from "@/utils/ApiError.js";
// import { roleRights } from "@/config/roles.js";
// import tokenService from "@/lib/services/token.service.js";
// import { tokenTypes } from "@/config/tokens.js";
// import { User } from "@/models";
// import { connectToDatabase } from "@/lib/mongoose"; // 👈 import thêm

// /**
//  * Middleware xác thực JWT và quyền truy cập
//  * @param {Request} req
//  * @param {string[]} requiredRights - Các quyền yêu cầu
//  * @returns {object} user - thông tin user đã xác thực
//  */
// export const verifyAuth = async (req, requiredRights = []) => {
//   const authHeader = req.headers.get("Authorization");
//   if (!authHeader?.startsWith("Bearer ")) {
//     throw new ApiError(401, "Please authenticate");
//   }

//   const token = authHeader.split(" ")[1];

//   let payload;
//   try {
//     // ✅ verify token, KHÔNG truyền expiresIn nữa
//     payload = await tokenService.verifyJwtPayload(token, tokenTypes.ACCESS);
//   } catch (error) {
//     console.error("Auth middleware error:", error);
//     throw new ApiError(401, "Token invalid or expired");
//   }

//   // ✅ Đảm bảo MongoDB đã kết nối trước khi query
//   await connectToDatabase();

//   // ✅ Lấy user từ MongoDB
//   const user = await User.findById(payload.sub);
//   if (!user) {
//     throw new ApiError(401, "User not found");
//   }

//   // ✅ Kiểm tra quyền
//   if (requiredRights.length) {
//     const userRights = roleRights.get(user.role) || [];
//     const hasRights = requiredRights.every((r) => userRights.includes(r));

//     if (!hasRights) {
//       throw new ApiError(403, "Forbidden");
//     }
//   }

//   return user;
// };

// /**
//  * Wrapper dùng trong route để áp dụng middleware xác thực
//  * @param {Function} handler - Route handler gốc
//  * @param {string[]} rights - Danh sách quyền yêu cầu
//  */
// export function withAuth(handler, rights = []) {
//   return async (req) => {
//     try {
//       const user = await verifyAuth(req, rights); // ✅ thiếu await ở bản cũ
//       req.user = user;
//       return await handler(req, user);
//     } catch (err) {
//       console.error("Auth failed:", err);
//       return NextResponse.json(
//         { message: err.message || "Authentication failed" },
//         { status: err.statusCode || httpStatus.UNAUTHORIZED }
//       );
//     }
//   };
// }
