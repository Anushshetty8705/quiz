import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return Response.json({
        success: false,
        message: "Invalid request",
      });
    }

    const client = await clientPromise;
    const db = client.db("Quiz");
    const collection = db.collection("users");

    const user = await collection.findOne({
      resetToken: token,
    });

    if (!user) {
      return Response.json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (new Date(user.resetTokenExpiry) < new Date()) {
      return Response.json({
        success: false,
        message: "Token expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await collection.updateOne(
      { resetToken: token },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: "",
        },
      }
    );

    return Response.json({
      success: true,
      message: "Password updated",
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}