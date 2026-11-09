// Route handlers - add new routes here
const routes = {
  async list(request, env) {
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
  },

  async all(request, env) {
    const { results } = await env.DB
      .prepare("SELECT rowid AS id, url FROM schedules")
      .all();
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        "Content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};

// Default route: proxy an image URL from D1 by id
async function defaultRoute(request, env, id) {
  if (!id) {
    id = "2026-02-22";
  }

  const result = await env.DB
    .prepare("SELECT url FROM URLS WHERE id = ? ORDER BY id DESC")
    .bind(id)
    .first();

  if (!result || !result.url) {
    return new Response("Not found " + id, { status: 404 });
  }

  return proxyImage(request, result.url);
}

// Proxy an image URL from D1 by schedules rowid
async function paintingRoute(request, env, rowId) {
  const result = await env.DB
    .prepare("SELECT url FROM schedules WHERE rowid = ?")
    .bind(Number(rowId))
    .first();

  if (!result || !result.url) {
    return new Response("Not found " + rowId, { status: 404 });
  }

  return proxyImage(request, result.url);
}

async function proxyImage(request, url) {
  const upstreamResponse = await fetch(url, {
    method: request.method,
    headers: request.headers,
    body: request.method !== "GET" && request.method !== "HEAD"
      ? request.body
      : undefined,
    redirect: "follow",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("content-security-policy");
  responseHeaders.delete("content-security-policy-report-only");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export default {
  async fetch(request, env, ctx) {
    try {
      const requestUrl = new URL(request.url);
      const path = requestUrl.pathname.replace(/^\/+/, "");

      if (path in routes) {
        return routes[path](request, env);
      }

      const painting = path.match(/^painting\/(\d+)$/);
      if (painting) {
        return paintingRoute(request, env, painting[1]);
      }

      return defaultRoute(request, env, path);
    } catch (err) {
      return new Response("Server error " + err, { status: 500 });
    }
  },
};
