// app/api/submitted-score/route.jsx
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const quizId = searchParams.get("quizId");
    console.log("Checking submission for studentId:", studentId, "quizId:", quizId);    
    if (!studentId || !quizId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing studentId or quizId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = await clientPromise;
    const db = client.db("Quiz");
    const collection = db.collection(`${quizId}`); // single collection for all submissions

    const existing = await collection.findOne({
      id: studentId,
      quizId: quizId,
      submitted: true
    });
if(existing){
return new Response(
      JSON.stringify({
        success: true,
        score:  existing.score||  0,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
}
    return new Response(
      JSON.stringify({ success: false}),
       
    );
    
  } catch (err) {
    console.error("Check submission error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}