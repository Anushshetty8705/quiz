import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    const client = await clientPromise;
    const db = client.db("Quiz");
    const otpCollection = db.collection("otp");

    const record = await otpCollection.findOne({ email });

    if (!record) {
      return new Response(JSON.stringify({ success: false, message: "OTP not found" }), { status: 400 });
    }

    if (record.expires < Date.now()) {
      return new Response(JSON.stringify({ success: false, message: "OTP expired" }), { status: 400 });
    }

    if (record.otp !== otp) {
      return new Response(JSON.stringify({ success: false, message: "Wrong OTP" }), { status: 400 });
    }

    // ✅ Delete OTP after success
    await otpCollection.deleteOne({ email });

    return new Response(JSON.stringify({ success: true, message: "OTP verified" }), {
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}