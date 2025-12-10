// Search users for creating group chat
import type { NextRequest } from "next/server"
import { authenticateRequest, createAuthResponse } from "@/lib/auth/middleware"
import { mockDB } from "@/lib/db/connection"
import type { User } from "@/lib/db/models"

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return createAuthResponse("Unauthorized")
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.toLowerCase() || null

    // Tất cả user trừ chính mình
    let allUsers = Array.from(mockDB.users.values())
      .filter((u: User) => u.id !== user.userId)

    // Nếu có query → lọc theo username hoặc name
    if (query) {
      allUsers = allUsers.filter((u: User) => {
        return (
          u.username.toLowerCase().includes(query) ||
          u.name.toLowerCase().includes(query)
        )
      })
    }

    // Lấy tối đa 10 user
    const limitedUsers = allUsers.slice(0, 10).map((u: User) => {
      const { password: _, ...userWithoutPassword } = u
      return userWithoutPassword
    })

    return Response.json({ users: limitedUsers })
  } catch (error) {
    console.error("[v0] Users fetch error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
