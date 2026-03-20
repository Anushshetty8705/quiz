import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE(request) {
  try {
    const { dashboard } = await request.json();

    if (!dashboard) {
      return NextResponse.json(
        { success: false, message: "Dashboard ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Quiz");

    // 1. Get all quizzes of teacher
    const quizzes = await db
      .collection("quizzes")
      .find({ teacherId: dashboard })
      .project({ quizCode: 1 })
      .toArray();

    // 2. Drop all quizCode collections (student data)
    for (const quiz of quizzes) {
      if (!quiz.quizCode) continue;

      try {
        await db.collection(quiz.quizCode).drop();
        console.log(`Dropped collection: ${quiz.quizCode}`);
      } catch (err) {
        // 🔥 IMPORTANT: ignore if collection doesn't exist
        if (err.codeName !== "NamespaceNotFound") {
          console.error(`Error dropping ${quiz.quizCode}:`, err);
        }
      }
    }

    // 3. Delete quizzes
    await db.collection("quizzes").deleteMany({
      teacherId: dashboard,
    });

    // 4. Delete user
    const result = await db.collection("users").deleteOne({
      id: dashboard,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account and all related data deleted successfully",
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}