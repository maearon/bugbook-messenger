import { Types } from "mongoose";
import httpStatus from 'http-status';
import { User } from '@/models/index';
import ApiError from '@/utils/ApiError';
import { removeVietnameseTones } from "@/utils/textUtils";

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email has already been taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * ✅ Check if a user exists with a specific email
 * (Giữ kiểu trả về tương thích với Drizzle: mảng có thể rỗng hoặc chứa 1 object)
 * @param {string} email
 * @returns {Promise<Array<User>>}
 */
const checkUserExistsWithEmail = async (email) => {
  const user = await User.findOne({ email }).lean();
  return user ? [user] : [];
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.deleteOne();
  return user;
};

/**
 * 🔍 Search users by keyword (tên/email, không dấu, gần đúng, bỏ khoảng trắng)
 * @param {string} keyword
 * @returns {Promise<Array<User>>}
 */
const searchUsersByKeyword = async (keyword) => {
  if (!keyword || typeof keyword !== "string") return [];

  // Chuẩn hóa keyword: bỏ dấu + thường hóa + bỏ khoảng trắng
  const normalizedKeyword = removeVietnameseTones(keyword)
    .toLowerCase()
    .replace(/\s+/g, "");

  // Lấy danh sách user
  const allUsers = await User.find({}, "_id name displayName username email avatar").lean();

  const filtered = allUsers
    .filter((u) => {
      const normalizedName = removeVietnameseTones(u.name || "")
        .toLowerCase()
        .replace(/\s+/g, ""); // ✅ bỏ khoảng trắng
      const normalizedEmail = (u.email || "").toLowerCase().replace(/\s+/g, "");

      return (
        normalizedName.includes(normalizedKeyword) ||
        normalizedEmail.includes(normalizedKeyword)
      );
    })
    .map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
    }));

  return filtered;
};

/**
 * 🔍 Search users (hỗ trợ query rỗng + loại trừ current user)
 * @param {string} q
 */
export const getAllUsersLikeFriends = async (q = null) => {
  try {
    // ✅ Lấy toàn bộ user
    let users = await User.find({})
      .select("_id name displayName username email avatar")
      .lean();

    if (!users.length) return [];

    // 🟩 Nếu có query → filter giống hệt friends API
    if (q) {
      const normalize = (str = "") =>
        str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

      const query = normalize(q);

      users = users.filter((u) => {
        const name = normalize(u.name);
        const displayName = normalize(u.displayName);
        const username = normalize(u.username);
        const email = normalize(u.email);

        return (
          name.includes(query) ||
          displayName.includes(query) ||
          username.includes(query) ||
          email.includes(query)
        );
      });
    }

    // ✅ Giới hạn 10 user
    users = users.slice(0, 10);

    // ✅ Xóa password
    users = users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });

    return users;
  } catch (error) {
    console.error("getAllUsersLikeFriends error:", error);
    return [];
  }
};

const userService = { 
  createUser, 
  queryUsers, 
  getUserById, 
  getUserByEmail, 
  checkUserExistsWithEmail,
  updateUserById, 
  deleteUserById,
  searchUsersByKeyword,
  getAllUsersLikeFriends,
};

export default userService;
