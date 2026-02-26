export default {
  async fetch(request, env, ctx) {
    try {
      const requestUrl = new URL(request.url);
      let id = requestUrl.pathname.replace(/^\/+/, "");

      if (id == "list") {
        const rows = await env.DB
          .prepare("SELECT * FROM URLS")
          .raw();
        let body = "<html>";
        for (const [id, name] of rows) {
          body += "<span>" + id + " <img src=" + name + " width='125' /></span>";
        }
        body += "</html>";
        return new Response(body, {
          status: 200,
          headers: { "Content-type": "text/html" },
        });
      }

      if (!id) {
        id = "2026-02-22";
      }

      // Query D1
      const result = await env.DB
        .prepare("SELECT url FROM URLS WHERE id = ? ORDER BY id DESC")
        .bind(id)
        .first();

      if (!result || !result.url) {
        return new Response("Not found " + id, { status: 404 });
      }

      // Fetch the target content
      const upstreamResponse = await fetch(result.url, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
        redirect: "follow",
      });

      // Clone headers safely
      const responseHeaders = new Headers(upstreamResponse.headers);

      // Remove problematic headers
      responseHeaders.delete("content-security-policy");
      responseHeaders.delete("content-security-policy-report-only");

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response("Server error " + err, { status: 500 });
    }
  },
};
