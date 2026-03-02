export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ---- API route: /api/contact ----
    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      try {
        const contentType = request.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          return new Response("Expected application/json", { status: 415 });
        }

        const { name, email, message, website } = await request.json();

        // honeypot
        if (website) return new Response("sent", { status: 200 });

        if (!name || !email || !message) {
          return new Response("Missing required fields", { status: 400 });
        }

        if (!env.RESEND_API_KEY) {
          return new Response("Missing RESEND_API_KEY", { status: 500 });
        }

        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "contact@lighthousewebstudio.com",
            to: "contact@lighthousewebstudio.com",
            reply_to: email,
            subject: `LHS Contact — ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          }),
        });

        if (!r.ok) {
          const txt = await r.text().catch(() => "");
          return new Response(`Resend error: ${txt || "unknown"}`, { status: 502 });
        }

        return new Response("sent", { status: 200 });
      } catch {
        return new Response("Server error", { status: 500 });
      }
    }

    // ---- Everything else: serve static site ----
    // With Workers Assets, this binding should exist.
    if (env.ASSETS) return env.ASSETS.fetch(request);

    return new Response("Not Found", { status: 404 });
  },
};