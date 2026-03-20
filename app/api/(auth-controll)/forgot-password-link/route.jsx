import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email } = await request.json();

    const client = await clientPromise;
    const db = client.db("Quiz");
    const collection = db.collection("users");

    const user = await collection.findOne({ email });

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      });
    }
    const resetToken = user.id;
    const expiry = new Date(Date.now() + 1000 * 60 * 15);

    await collection.updateOne(
      { email },
      {
        $set: {
          resetToken,
          resetTokenExpiry: expiry,
        },
      }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `https://quiz-master-two-iota.vercel.app/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `
        <h3>Reset Your Password</h3>
        <p>Click below link to reset:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    return Response.json({
      success: true,
      message: "Reset link sent to email",
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}