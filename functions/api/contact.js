export async function onRequestPost({ request, env }) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response("Expected JSON", { status: 415 });
    }

    const { name, email, message, website } = await request.json();

    // Honeypot (bots fill it; humans won't)
    if (website) return new Response("ok", { status: 200 });

    // Basic validation
    if (!name || !email || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Minimal email sanity check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response("Invalid email", { status: 400 });
    }

    const RESEND_KEY = env.RESEND_API_KEY;
    if (!RESEND_KEY) {
      return new Response("Server misconfigured", { status: 500 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // IMPORTANT: Resend requires a verified "from" domain.
        from: "hello@lighthousewebstudio.com",
        to: "contact@lighthousewebstudio.com",
        reply_to: email,
        subject: `LHS Contact — ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return new Response(`Resend error: ${errText}`, { status: 502 });
    }

    return new Response("sent", { status: 200 });
  } catch {
    return new Response("Server error", { status: 500 });
  }
}