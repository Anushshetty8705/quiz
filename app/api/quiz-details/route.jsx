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

    if (quizzedetails.length === 0) {
      return NextResponse.json(
        { success: false, message: "No quizzes found" },
        { status: 404 }
      );
    }
const coursecode = await db
      .collection("quizzes")
      .findOne({ quizCode: quizzid, teacherId: teacherId });

    // ✅ Wait for all student counts

    return NextResponse.json({
      success: true,
      quizzedetails,
      coursecode: coursecode?.subjectCode || null,
      isLocked: coursecode?.isLocked || false
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}