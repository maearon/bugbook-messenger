export const runtime = "nodejs";
import { withAuth } from "@/middlewares/auth.js";
import httpStatus from "http-status";
import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { tokenService, emailService } from "@/lib/services";
import type { NextRequest } from "next/server";

async function sendVerificationEmail(req: NextRequest, user: { id: string; email: string; name: string }) {
  await connectToDatabase();

  try {
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);

    await emailService.sendVerificationEmail(user.email, verifyEmailToken);

    return new NextResponse(null, { status: httpStatus.NO_CONTENT });
  } catch (error) {
    console.error("Error sending verification email:", error);

    const message =
      error instanceof Error ? error.message : "Send Verification Email failed";

    return NextResponse.json(
      { message },
      { status: httpStatus.BAD_REQUEST }
    );
  }
}

export const POST = withAuth(sendVerificationEmail, []);
