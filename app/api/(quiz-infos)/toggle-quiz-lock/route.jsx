import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { teacherId, quizId, lock } = await req.json();
console.log("Received toggle lock request:", { teacherId, quizId, lock });
    const client = await clientPromise;
    const db = client.db("Quiz");

    await db.collection("quizzes").updateOne(
      { teacherId,
quizCode: quizId },
      { $set: { isLocked: lock } },
    );

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}