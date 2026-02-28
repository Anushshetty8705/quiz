import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const quizId = searchParams.get("quizId");

  const client = await clientPromise;
  const db = client.db("Quiz");
  const collection = db.collection(quizId);

  const student = await collection.findOne({ id: studentId });
const quizlocked = await db.collection("quizzes").findOne({ 
quizCode: quizId });

  if(quizlocked && quizlocked.isLocked){
    return NextResponse.json({ success: true, student: { locked: true, lockedReason: "Quiz is locked by the teacher." } });
  }
  if (!student) {
    return NextResponse.json({ success: false });
  }

  return NextResponse.json({
    success: true,
    student,
  });
}