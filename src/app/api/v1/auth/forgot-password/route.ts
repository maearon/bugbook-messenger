import httpStatus from "http-status";
import { connectToDatabase } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { emailService, tokenService } from "@/lib/services"; // đường dẫn tương ứng

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const { email }: { email: string } = await req.json();

    const resetPasswordToken = await tokenService.generateResetPasswordToken(email);
    await emailService.sendResetPasswordEmail(email, resetPasswordToken);

    return NextResponse.json(null, { status: httpStatus.NO_CONTENT });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    return NextResponse.json(
      { message },
      { status: httpStatus.BAD_REQUEST }
    );
  }
}