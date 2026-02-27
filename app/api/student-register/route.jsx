import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
export async function POST(req) {

  try {
    const { name, regNo, email ,quizid} = await req.json();
    if (!name || !regNo || !email) {
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Quiz");
const existingStudent = await db.collection(`${quizid}`).findOne({ regNo , quizId: quizid   });
if(!existingStudent){
     await db.collection(`${quizid}`).insertOne({
      name,
      regNo,
      email,
      quizId: quizid,
      id:uuidv4(),      
      createdAt: new Date(),
    });
  }
const result = await db.collection(`${quizid}`).findOne({regNo });
    return NextResponse.json({
      success: true,
      id: result.id,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}