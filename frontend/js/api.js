// /web/js/api.js
(function () {
    /**
     * Нормализация для отправки на сервер: строка -> строка с точкой как разделителем.
     */
    function normalizeForQuery(v) {
        if (v == null) return "";
        // Поддерживаем Decimal (из validator), числа и строки
        if (typeof v === "object" && typeof v.toString === "function") return v.toString();
        return String(v).trim().replace(",", ".");
    }

    /**
     * Выполнить GET-запрос к /check?x=..&y=..&r=..
     * @param {{x: string|number, y: string|number|Decimal, r: string|number|Decimal}} params
     * @returns {Promise<Object>} ответ JSON:
     *   { now, execTimeMs, input:{x,y,r}, hit, history }  или  { error }
     */
    async function getCheck({ x, y, r }) {
        const search = new URLSearchParams({
            x: normalizeForQuery(x),
            y: normalizeForQuery(y),
            r: normalizeForQuery(r),
        });

        const url = `/check?${search.toString()}`;

        let resp;
        try {
            resp = await fetch(url, {
                method: "GET",
                headers: { "Accept": "application/json" },
                cache: "no-store",
            });
        } catch (e) {
            // Сетевая ошибка: сервер недоступен, нет интернета и т.д.
            return { error: "Сеть недоступна или сервер не отвечает." };
        }

        let data;
        try {
            data = await resp.json();
        } catch {
            // Невалидный JSON от сервера
            return { error: "Некорректный ответ сервера." };
        }

        // Если сервер вернул код ошибки или поле error — прокинем наверх
        if (!resp.ok || (data && data.error)) {
            return { error: data?.error || `Ошибка сервера (${resp.status})` };
        }

        return data;
    }

    window.ApiClient = { getCheck };
})();
