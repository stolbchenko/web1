(function () {
    const { qs, qsa, on, setHtml, cls } = window.DOM;

    function FormView(formSelector = "#point-form") {
        const form = qs(formSelector);
        const yInput = qs("#y", form);
        const rInput = qs("#r", form);

        return {
            el: form,

            read() {
                const xChecked = qs('input[name="x"]:checked', form);
                return {
                    x: xChecked ? xChecked.value : null,
                    y: yInput ? yInput.value : "",
                    r: rInput ? rInput.value : ""
                };
            },

            onSubmit(handler) {
                on(form, "submit", (e) => {
                    e.preventDefault();
                    handler();
                });
            },

            highlightErrors({ yErr = false, rErr = false } = {}) {
                cls(yInput, "input-error", yErr);
                cls(rInput, "input-error", rErr);
            }
        };
    }

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

    function TableView(tableSelector = "#history") {
        const table = qs(tableSelector);
        const tbody = qs("#history-body") || qs("tbody", table);

        return {
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

    window.Views = { FormView, ErrorView, TableView };
})();
