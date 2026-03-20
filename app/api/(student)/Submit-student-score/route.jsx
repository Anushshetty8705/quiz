import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";  
export async function POST(request) {
  const { score, studentId, quizId } = await request.json();

  const client = await clientPromise;
  const db = client.db("Quiz");
  const collection = db.collection(quizId);

  await collection.updateOne(
    { id: studentId },
    { $set: { score, submitted: true } }
  );

  return NextResponse.json({ success: true });
}