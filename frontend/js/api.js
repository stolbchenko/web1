
(function () {
  const ENDPOINT = "/fcgi-bin/backend-1.0-SNAPSHOT-all.jar";

  function normalizeForQuery(v) {
    if (v == null) return "";
    if (typeof v === "object" && typeof v.toString === "function") return v.toString();
    return String(v).trim().replaceAll(",", ".");
  }


  async function getCheck({ x, y, r }) {
    const search = new URLSearchParams({
      x: normalizeForQuery(x),
      y: normalizeForQuery(y),
      r: normalizeForQuery(r),
    });

    const url = `${ENDPOINT}?${search.toString()}`;


    let resp;
    try {
      resp = await fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store",
      });
    } catch (e) {
      return { error: "Сеть недоступна или сервер не отвечает." };
    }

    let dataText;
    try {
      dataText = await resp.text();
      const json = JSON.parse(dataText);
      if (!resp.ok || json?.error) {
        return { error: json?.error || "Ошибка сервера" };
      }
      return json;
    } catch {
      return { error: "Некорректный ответ сервера" };
    }
  }

  window.ApiClient = { getCheck };
})();
