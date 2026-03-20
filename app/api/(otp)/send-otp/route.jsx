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
      from: `"Quiz-Pro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
     html: `
        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
          <div style="margin: 50px auto; width: 70%; padding: 20px 0">
            <div style="border-bottom: 1px solid #eee">
              <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">Quiz-Pro</a>
            </div>
            <p style="font-size: 1.1em">Hi,</p>
            <p>Thank you for choosing Quiz-Pro. Use the following OTP to complete your verification procedures. <strong>OTP is valid for 5 minutes.</strong></p>
            <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">
              ${otp}
            </h2>
            <p style="font-size: 0.9em;">Regards,<br />Quiz-Pro Team</p>
            <hr style="border: none; border-top: 1px solid #eee" />
            <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
              <p>Quiz-Pro Inc</p>
              <p>Shimoga</p>
            </div>
          </div>
        </div>
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