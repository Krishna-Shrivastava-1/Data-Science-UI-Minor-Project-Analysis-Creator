import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();

    // If the frontend sends { data: [...] }, extract it
    const data = Array.isArray(body) ? body : body.data;

    console.log("✅ Sending to Flask:", data);

    // Send raw array to Flask (not wrapped inside an object)
    const response = await fetch("http://127.0.0.1:5000/clean", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
     body: typeof data === "string" ? data : JSON.stringify(data),

    });

    const result = await response.json();
    console.log("✅ Flask returned:", result);

    return NextResponse.json({
      message: "Raw data summary",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ message: "Server error", error: error.message });
  }
}
