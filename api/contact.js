export async function onRequestPost({ request, env }) {
  try {
    // Enforce JSON
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response("Expected application/json", { status: 415 });
    }

    const { name, email, message, website } = await request.json();

    // Honeypot: pretend success to bots (prevents them learning)
    if (website) {
      return new Response("sent", { status: 200 });
    }

    // Validation
    if (!name || !email || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Light email sanity check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response("Invalid email", { status: 400 });
    }

    if (!env.RESEND_API_KEY) {
      return new Response("Server misconfigured (missing RESEND_API_KEY)", { status: 500 });
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "contact@lighthousewebstudio.com",
        to: "contact@lighthousewebstudio.com",
        reply_to: email,
        subject: `LHS Contact Form — ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => "");
      return new Response(`Resend error: ${errText || "unknown"}`, { status: 502 });
    }

    return new Response("sent", { status: 200 });
  } catch (e) {
    return new Response("Server error", { status: 500 });
  }
}