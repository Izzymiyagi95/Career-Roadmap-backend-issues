// app/api/analyze/route.js
export async function POST(request) {
  try {
    // Extract formData from incoming request
    const formData = await request.formData();

    // Forward to Express backend (running on port 3001)
    const response = await fetch("http://localhost:3001/api/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({
          error: errorData.error || `Backend error: ${response.status}`,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: `Proxy error: ${error.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
