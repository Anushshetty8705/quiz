import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Quizz");

    const reports = await db
      .collection("malpractice_reports")
      .find({quizId})
      .sort({ reportedAt: -1 })
      .toArray();

    return new Response(
      JSON.stringify({ success: true, reports }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
    });
  }
}