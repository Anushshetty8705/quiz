import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { studentId, quizId } = await req.json();
    const client = await clientPromise;
    const db = client.db("Quiz");

    // Remove the report
    await db.collection(quizId).updateOne({ id:studentId },
      { $set: { locked: false } }
    );

    return new Response(JSON.stringify({ success: true }))
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
    });
  }
}