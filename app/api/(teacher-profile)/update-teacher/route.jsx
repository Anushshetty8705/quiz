import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { dashboard, formData } = await req.json();

    if (!dashboard) {
      return new Response(JSON.stringify({ success: false, message: "Dashboard ID missing" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Quiz");

    const user = await db.collection("users").findOne({ id: dashboard });

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    // Prepare update object
    let updateData = {
      name: formData.name,
      department: formData.department,
    };

    // 🔐 Handle Password update
    if (formData.ForgotPassword && formData.confirmPassword) {
      const hashedPassword = await bcrypt.hash(formData.confirmPassword, 10);
      updateData.password = hashedPassword;
    }

    // Perform Update
    const result = await db.collection("users").updateOne(
      { id: dashboard },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ success: false, message: "Failed to update" }), { status: 400 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile updated successfully",
      }),
      { status: 200 }
    );
    
  } catch (err) {
    console.error("Update Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}