// /web/js/view.js
(function () {
    const { qs, qsa, on, setHtml, cls } = window.DOM;

    /* ========================= FormView ========================= */
    function FormView(formSelector = "#point-form") {
        const form = qs(formSelector);
        const yInput = qs("#y", form);
        const rInput = qs("#r", form);

        return {
            el: form,

            /** Считать сырые значения полей формы */
            read() {
                const xChecked = qs('input[name="x"]:checked', form);
                return {
                    x: xChecked ? xChecked.value : null,
                    y: yInput ? yInput.value : "",
                    r: rInput ? rInput.value : ""
                };
            },

            /** Навесить обработчик submit (preventDefault внутри) */
            onSubmit(handler) {
                on(form, "submit", (e) => {
                    e.preventDefault();
                    handler();
                });
            },

            /** Подсветить/снять подсветку ошибок по полям */
            highlightErrors({ yErr = false, rErr = false } = {}) {
                cls(yInput, "input-error", yErr);
                cls(rInput, "input-error", rErr);
            }
        };
    }

    /* ========================= ErrorView ========================= */
    function ErrorView(containerSelector = "#errors") {
        const box = qs(containerSelector);

        return {
            show(messages) {
                if (!messages || !messages.length) {
                    this.clear();
                    return;
                }
                const html = `<ul>${messages.map(m => `<li>${escapeHtml(m)}</li>`).join("")}</ul>`;
                setHtml(box, html);
            },
            clear() {
                setHtml(box, "");
            }
        };
    }

    /* ========================= TableView ========================= */
    function TableView(tableSelector = "#history") {
        const table = qs(tableSelector);
        const tbody = qs("tbody", table);

        return {
            /** Полная перерисовка таблицы истории */
            render(history) {
                if (!Array.isArray(history)) {
                    setHtml(tbody, "");
                    return;
                }
                const rows = history.map(rowHtml).join("");
                setHtml(tbody, rows);
            }
        };

        function rowHtml(item) {
            // Ожидаем поля: x, y, r, hit, at, execTimeMs
            const y = safeStr(item.y);
            const r = safeStr(item.r);
            const at = formatTime(item.at);
            const ms = formatMs(item.execTimeMs);
            const hit = item.hit ? "да" : "нет";
            return `
        <tr>
          <td>${escapeHtml(item.x)}</td>
          <td>${escapeHtml(y)}</td>
          <td>${escapeHtml(r)}</td>
          <td>${escapeHtml(hit)}</td>
          <td>${escapeHtml(at)}</td>
          <td>${escapeHtml(ms)}</td>
        </tr>
      `;
        }

        function formatTime(iso) {
            // Покажем локально без библиотек
            try {
                const d = new Date(iso);
                if (isNaN(d.getTime())) return String(iso ?? "");
                // YYYY-MM-DD HH:mm:ss
                const pad = (n) => String(n).padStart(2, "0");
                return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            } catch {
                return String(iso ?? "");
            }
        }

        function formatMs(ms) {
            if (ms == null) return "";
            const num = Number(ms);
            if (Number.isFinite(num)) return num.toFixed(3);
            return String(ms);
        }
    }

    /* ========================= (Опционально) GraphView ========================= */
    // Базовая реализация: рисуем точку на графике и (по желанию) область
    function GraphView(svgSelector = "#graph") {
        const svg = qs(svgSelector);

        // Координатная система уже задана viewBox="-6 -6 12 12"
        return {
            drawArea(R) {
                // Минималистично: очистим предыдущую область и оставим оси нетронутыми
                removeByClass("area-shape");

                if (!R) return;

                // Прямоугольник (IV): 0 ≤ x ≤ R/2, -R ≤ y ≤ 0
                const rect = createSvg("rect", {
                    x: 0, y: -Number(R),
                    width: Number(R) / 2,
                    height: Number(R),
                    class: "area-shape",
                    fill: "rgba(100,150,255,0.2)",
                    stroke: "none"
                });
                svg.appendChild(rect);

                // Треугольник (III): точки (-R/2,0), (0,0), (0,-R/2)
                const tri = createSvg("polygon", {
                    points: `${-Number(R)/2},0 0,0 0,${-Number(R)/2}`,
                    class: "area-shape",
                    fill: "rgba(100,255,150,0.2)",
                    stroke: "none"
                });
                svg.appendChild(tri);

                // Четверть круга (II): дуга радиуса R
                // Нарисуем грубо окружность-сектор через path (четверть круга)
                const r = Number(R);
                const pathD = [
                    `M 0,0`,
                    `L ${-r},0`,
                    `A ${r},${r} 0 0 1 0,${r}`,
                    `Z`
                ].join(" ");
                const sector = createSvg("path", {
                    d: pathD,
                    class: "area-shape",
                    fill: "rgba(255,200,100,0.2)",
                    stroke: "none"
                });
                svg.appendChild(sector);
            },

            plotPoint(x, y) {
                // Удалим прошлые точки, если хочешь хранить историю — убери очистку
                removeByClass("point-dot");

                const cx = Number(x);
                const cy = Number(y);
                if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;

                const dot = createSvg("circle", {
                    cx, cy, r: 0.1,
                    class: "point-dot",
                    fill: "crimson",
                    stroke: "none"
                });
                svg.appendChild(dot);
            }
        };

        function removeByClass(clsName) {
            qsa(`.${clsName}`, svg).forEach(n => n.remove());
        }

        function createSvg(tag, attrs) {
            const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
            for (const [k, v] of Object.entries(attrs || {})) {
                el.setAttribute(k, String(v));
            }
            return el;
        }
    }

    /* ========================= helpers ========================= */
    function escapeHtml(s) {
        return String(s ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function safeStr(v) {
        return v == null ? "" : String(v);
    }

    // Экспорт
    window.Views = { FormView, ErrorView, TableView, GraphView };
})();
