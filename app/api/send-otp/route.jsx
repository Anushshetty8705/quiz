import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email required" }),
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Connect MongoDB
    const client = await clientPromise;
    const db = client.db("Quiz");
    const otpCollection = db.collection("otp");

    // Save OTP (overwrite old)
    await otpCollection.updateOne(
      { email },
      { $set: { otp, expires } },
      { upsert: true }
    );

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    // Send Email
    await transporter.sendMail({
      from: `"XTrack OTP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <h1 style="color:blue">${otp}</h1>
        <p>Valid for 5 minutes.</p>
      `,
    });

    return new Response(JSON.stringify({ success: true, message: "OTP sent" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send OTP Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}