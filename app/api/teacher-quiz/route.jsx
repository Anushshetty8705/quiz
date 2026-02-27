import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { success: false, message: "Teacher ID missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Quiz");

    const quizzes = await db
      .collection("quizzes")
      .find({ teacherId: teacherId })
      .toArray();

    if (quizzes.length === 0) {
      return NextResponse.json(
        { success: false, message: "No quizzes found" },
        { status: 404 }
      );
    }

    // ✅ Wait for all student counts
    await Promise.all(
      quizzes.map(async (quiz) => {
        const studentCount = await db
          .collection(quiz.quizCode) // dynamic collection
          .countDocuments();

        quiz.studentCount = studentCount;
      })
    );
console.log(quizzes);
    return NextResponse.json({
      success: true,
      quizzes,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}