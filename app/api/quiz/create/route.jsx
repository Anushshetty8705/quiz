import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // your MongoDB connection

export async function POST(req) {
  try {
    const body = await req.json();
    const { subjectCode, quizCode, questions,teacherId } = body;

    if (!subjectCode || !questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Quiz");

    const result = await db.collection("quizzes").insertOne({
      subjectCode,
      quizCode,
      questions,
      teacherId,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Quiz saved successfully",
      id: result.insertedId,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}