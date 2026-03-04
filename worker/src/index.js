export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method === "GET") {
      return jsonResponse({
        ok: true,
        service: "ip-worker-test-site",
        time: new Date().toISOString(),
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders(),
      });
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ua = request.headers.get("User-Agent") || "";
    const cf = request.cf || {};
    const receivedAt = new Date().toISOString();
    const payload = await parseJsonBody(request);
    const ipinfo = await lookupIpinfo(ip, env.IPINFO_TOKEN);

    const record = {
      ip,
      ua,
      country: cf.country ?? null,
      asn: cf.asn ?? null,
      colo: cf.colo ?? null,
      at: receivedAt,
      page_url: payload.page_url ?? null,
      event: payload.event ?? "page_visit",
      company_name: ipinfo?.company_name ?? null,
      company_domain: ipinfo?.company_domain ?? null,
      company_type: ipinfo?.company_type ?? null,
      org: ipinfo?.org ?? null,
      ipinfo_error: ipinfo?.error ?? null,
    };

    let dbSaved = false;
    let dbError = null;
    try {
      await env.DB.prepare(
        `INSERT INTO visits (
          at, ip, ua, country, asn, colo,
          page_url, event,
          company_name, company_domain, company_type, org
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          record.at,
          record.ip,
          record.ua,
          record.country,
          record.asn,
          record.colo,
          record.page_url,
          record.event,
          record.company_name,
          record.company_domain,
          record.company_type,
          record.org
        )
        .run();
      dbSaved = true;
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err);
    }

    return jsonResponse({
      status: 200,
      ok: true,
      body: record,
      db_saved: dbSaved,
      db_error: dbError,
    });
  },
};

async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function lookupIpinfo(ip, token) {
  if (!token || ip === "unknown") {
    return null;
  }

  try {
    const url = `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      return { error: `ipinfo_http_${res.status}` };
    }

    const data = await res.json();
    return {
      org: data.org ?? null,
      company_name: data.company?.name ?? null,
      company_domain: data.company?.domain ?? null,
      company_type: data.company?.type ?? null,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
  });
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}
