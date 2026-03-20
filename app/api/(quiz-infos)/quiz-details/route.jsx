import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const quizzid=searchParams.get("quizId");
    if (!teacherId || !quizzid) {
      return NextResponse.json(
        { success: false, message: "Teacher ID or Quiz ID missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Quiz");

    const quizzedetails = await db
      .collection(quizzid)
      .find()
      .toArray();

    // 
const quiz = await db
      .collection("quizzes")
      .findOne({ quizCode: quizzid, teacherId: teacherId });

    // ✅ Wait for all student counts

    return NextResponse.json({
      success: true,
      quizzedetails,
      coursecode: quiz?.subjectCode || null,
      isLocked: quiz?.isLocked || false,
      time:quiz.Time,
      questions:quiz.questions
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}