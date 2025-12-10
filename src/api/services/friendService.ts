import api from "@/api/client";

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const friendService = {
  addFriend: async (userId: string) => {
    const res = await api.post("/friends/requests", {
      to: userId,
      message: "Kết bạn nhé!",
    });

    return res.data;
  },

  getFriendRequests: async () => {
    const res = await api.get("/friends/requests");
    return res.data;
  },

  responseFriendRequest: async (id: string, action: string) => {
    const res = await api.post(`/friends/requests/${id}/${action}`);
    return res.data;
  },

  /**
   * GET /friends
   * - Nếu không truyền q → trả về toàn bộ friend list
   * - Nếu truyền q → backend sẽ filter theo q
   */
  getFriends: async (q?: string): Promise<{ friends: Friend[] }> => {
    const res = await api.get("/friends", {
      params: q ? { q } : {},
    });

    return res.data;
  },
};
