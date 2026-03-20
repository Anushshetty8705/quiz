import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, password, email} = body;

    if (!name || !password || !email) {
      return Response.json({ success: false, message: "All fields are required" });
    }

    const client = await clientPromise;
    const db = client.db("Quiz");
    const collection = db.collection("users");

    // Check existing user (name OR email)
    const existingUser = await collection.findOne({
      $or: [{ name }, { email }],
    });

    if (existingUser) {
      let msg = "User already exists";
      if (existingUser.name === name) msg = "Name already exists";
      if (existingUser.email === email) msg = "Email already exists";
      return Response.json({ success: false, message: msg });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
     await collection.insertOne({
      name,
      password: hashedPassword,
      email,
      id:uuidv4(),
      createdAt: new Date(),
    });
const result = await collection.findOne({email})
    return Response.json({
      success: true,
      message: "Registration successful",
     id: result.id
    });

  } catch (error) {
    console.error("Register Error:", error);
    return Response.json({ success: false, message: "Server error" });
  }
}