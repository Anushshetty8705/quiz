
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export default async function DELETE() {
 const { id } = await request.json();
 try{
    const client = await clientPromise;
    const db = client.db("Quiz");
    const quiz_list = await db.collection("quizzes").find({ teacherId: id }).toArray();
    for (const quiz of quiz_list) {
      await db.collection(quiz.quizCode).drop();
    }
    await db.collection("quizzes").deleteMany({ teacherId: id });
    await db.collection("users").deleteOne({ id });

    return NextResponse.json({ success: true });
 }catch(err){

  return new Response(JSON.stringify({ success: false, message: "An error occurred while trying to delete your account. Please try again later." }), { status: 500 });
 }
}