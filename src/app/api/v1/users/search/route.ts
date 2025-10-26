// /app/api/v1/users/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import httpStatus from "http-status";
import { userService } from "@/lib/services";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    const name = req.nextUrl.searchParams.get("name") || "";
    const users = await userService.searchUsersByName(name);

    return NextResponse.json({ users }, { status: httpStatus.OK });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
