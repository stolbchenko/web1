(function () {
    function qs(sel, root = document) {
        return root.querySelector(sel);
    }

    function qsa(sel, root = document) {
        return Array.from(root.querySelectorAll(sel));
    }

    function on(el, evt, fn, opts) {
        el.addEventListener(evt, fn, opts);
        return () => el.removeEventListener(evt, fn, opts);
    }

    function setText(el, text) {
        el.textContent = text == null ? "" : String(text);
    }

    function setHtml(el, html) {
        el.innerHTML = html == null ? "" : String(html);
    }

    function cls(el, name, on) {
        if (!el) return;
        el.classList.toggle(name, !!on);
    }

    window.DOM = { qs, qsa, on, setText, setHtml, cls };
})();
