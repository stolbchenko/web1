
(function () {
    const KEY = "lab-history";
    const LIMIT = 1000;


    function normalizeItem(it) {
        if (!it) return null;
        return {
            x: Number(it.x),
            y: String(it.y),
            r: String(it.r),
            hit: !!it.hit,
            at: String(it.at),
            execTimeMs: String(it.execTimeMs)
        };
    }

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            if (!Array.isArray(arr)) return [];
            return arr.map(normalizeItem).filter(Boolean);
        } catch {
            return [];
        }
    }

    function save(history) {
        try {
            const arr = Array.isArray(history) ? history.slice(0, LIMIT) : [];
            localStorage.setItem(KEY, JSON.stringify(arr));
        } catch {
            // игнорируем переполнение/отказ
        }
    }


    function merge(serverHistory) {
        const srv = Array.isArray(serverHistory) ? serverHistory.map(normalizeItem).filter(Boolean) : [];
        const result = srv.slice(-LIMIT);
        save(result);
        return result;
    }

    window.HistoryStore = { load, save, merge, LIMIT };
})();
