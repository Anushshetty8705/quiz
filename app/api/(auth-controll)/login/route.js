import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    console.log("Login API called");
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({
        success: false,
        message: "All fields required",
      });
    }

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

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return Response.json({
        success: false,
        message: "Invalid password",
      });
    }

    return Response.json({
      success: true,
      message: "Login successful",
      id: user.id,
    });
  } catch (error) {
    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}