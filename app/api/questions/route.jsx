import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const quizid = searchParams.get("quizid");
   
    if (!quizid) {
      return NextResponse.json(
        { success: false, message: "Quiz ID missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Quiz");

    // 🔥 find quiz document
    const quiz = await db
      .collection("quizzes")
      .findOne({ quizCode: quizid });

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: "Quiz not found" },
        { status: 404 }
      );
    }


    return NextResponse.json({
      success: true,
      questions: quiz.questions, // 👈 return only questions array
      Time:quiz.Time
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}