import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { studentId, quizId, reason } = await req.json();

    if (!studentId || !quizId || !reason) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Quiz");
const studentinfo=await db.collection(`${quizId}`).findOne({id:studentId})
console.log(studentinfo.name,studentinfo.regNo)
    // Save report
    await db.collection("malpractice_reports").insertOne({
      studentId,
      quizId,
      reason,
      locked: true,
      createdAt: new Date(),
      studentname:studentinfo?.name || "Unknown",
      studenregNo:studentinfo?.regNo || "Unknown"
    });

    // Lock student
    await db.collection("student_locks").updateOne(
      { studentId, quizId },
      { $set: { locked: true, reason } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}