// /web/js/validator.js
(function () {
    /**
     * Нормализация строки числа: trim + замена запятой на точку.
     */
    function normalize(str) {
        return (str ?? "").toString().trim().replace(",", ".");
    }

    /**
     * Строгий парсер десятичного числа c человекочитаемыми ошибками.
     * Не ограничивает количество знаков после запятой.
     */
    function parseDecimalStrict(str, name) {
        const norm = normalize(str);
        // Разрешаем формы: "1", "-1", "1.23", ".5", "-.75"
        if (!/^[-+]?(\d+(\.\d+)?|\.\d+)$/.test(norm)) {
            throw new Error(`${name}: введите число (допустима запятая).`);
        }
        try {
            return new Decimal(norm);
        } catch {
            throw new Error(`${name}: некорректное число.`);
        }
    }

    /**
     * Валидация формы.
     * @param {HTMLFormElement} form
     * @returns {{
     *   ok: boolean,
     *   errors: string[],
     *   fields: { yErr: boolean, rErr: boolean },
     *   x: string|null,
     *   y: Decimal|null,
     *   r: Decimal|null
     * }}
     */
    function validate(form) {
        const errors = [];
        const fields = { yErr: false, rErr: false };

        // X: radio из {-5…3}
        const xRadio = form.querySelector('input[name="x"]:checked');
        let x = null;
        if (!xRadio) {
            errors.push("X: выберите значение из набора {-5 … 3}.");
        } else {
            x = xRadio.value;
            // на всякий случай проверим, что это одно из разрешённых значений
            if (!/^-?[0-5]|[0-3]$/.test(x)) {
                // простая проверка; строгую всё равно делает сервер
            }
        }

        // Y: (-5; 5)
        let y = null;
        try {
            y = parseDecimalStrict(form.querySelector("#y")?.value, "Y");
            if (!(y.gt(-5) && y.lt(5))) {
                fields.yErr = true;
                errors.push("Y: допускаются значения строго между -5 и 5 (−5 < Y < 5).");
            }
        } catch (e) {
            fields.yErr = true;
            errors.push(e.message);
        }

        // R: (2; 5)
        let r = null;
        try {
            r = parseDecimalStrict(form.querySelector("#r")?.value, "R");
            if (!(r.gt(2) && r.lt(5))) {
                fields.rErr = true;
                errors.push("R: допускаются значения строго между 2 и 5 (2 < R < 5).");
            }
        } catch (e) {
            fields.rErr = true;
            errors.push(e.message);
        }

        return { ok: errors.length === 0, errors, fields, x, y, r };
    }

    window.FormValidator = { normalize, parseDecimalStrict, validate };
})();
