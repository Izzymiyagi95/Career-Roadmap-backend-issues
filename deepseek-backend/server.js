// app/api/analyze/route.js
export async function POST(request) {
  try {
    // Get the formData from the request
    const formData = await request.formData();

    // Forward the request to your backend server
    const response = await fetch("http://localhost:4000/api/analyze", {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - let it be set automatically
    });

    // Check if response is ok
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

    // Forward the successful response back to client
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({
        error: `Proxy error: ${error.message}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}