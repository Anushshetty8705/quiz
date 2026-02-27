import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    console.log("Received quiz verification request");  
    const { subjectCode, quizCode } = await req.json();

    if (!subjectCode || !quizCode) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Quiz");

    const quiz = await db.collection("quizzes").findOne({
      subjectCode,
      quizCode,
    });
    if(quiz.isLocked){
      return NextResponse.json(
        { success: false, message: "Quiz is locked contact your teacher " },
        { status: 403 }
      );
    }

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: "Invalid quiz details" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}