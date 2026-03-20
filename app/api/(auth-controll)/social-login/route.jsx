import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("Quiz");
    const collection = db.collection("users");

    let user = await collection.findOne({ email: body.email });

    if (user) {
      // Existing user → return UUID
      return NextResponse.json({
        error: false,
        id: user.id,
        name: user.name,
        email: user.email,
        mode: user.mode,
      });
    }
   const id = uuidv4();
    await collection.insertOne({
      id: id,
      name: body.name,
      email: body.email,
      mode: body.mode || "user",
    });

    return NextResponse.json({
      error: false,
      id: id,
    });

  } catch (error) {
    console.error("Social login error:", error);
    return NextResponse.json({ error: true, message: "Internal server error" });
  }
}