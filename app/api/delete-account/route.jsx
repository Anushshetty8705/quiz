import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE(request) {
  try {
    // 1. Extract the ID correctly from the request body
    const { dashboard: id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Quiz");

    // 2. Find all quizzes created by this teacher
    const quiz_list = await db.collection("quizzes").find({ teacherId: id }).toArray();

    // 3. Drop student response collections for each quiz
    // We use Promise.all to handle this concurrently for better performance
    await Promise.all(
      quiz_list.map(async (quiz) => {
        try {
          // Check if the collection exists before dropping to avoid errors
          const collections = await db.listCollections({ quizCode: quiz.quizCode }).toArray();
          if (collections.length > 0) {
            await db.collection(quiz.quizCode).drop();
          }
        } catch (dropErr) {
          console.error(`Failed to drop collection ${quiz.quizCode}:`, dropErr);
          // We continue anyway to ensure the user account still gets deleted
        }
      })
    );

    // 4. Delete the quiz metadata from the central 'quizzes' collection
    await db.collection("quizzes").deleteMany({ teacherId: id });

    // 5. Finally, delete the teacher's user account
    const userDeleteResult = await db.collection("users").deleteOne({ id: id });

    if (userDeleteResult.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Account and data deleted successfully" });

  } catch (err) {
    console.error("Delete Account Error:", err);
    return NextResponse.json(
      { success: false, message: "An error occurred while trying to delete your account." },
      { status: 500 }
    );
  }
}