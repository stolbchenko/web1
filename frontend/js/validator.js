(function () {

    function normalize(str) {
        return (str ?? "").toString().trim().replaceAll(",", ".");
    }


    function parseDecimalStrict(str, name) {
        const norm = normalize(str);
        if (!/^[-+]?(\d+(\.\d+)?|\.\d+)$/.test(norm)) {
            throw new Error(`${name}: введите число (допустима запятая).`);
        }
        try {
            return new Decimal(norm);
        } catch {
            throw new Error(`${name}: некорректное число.`);
        }
    }


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
            const ALLOWED_X = new Set(["-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3"]);
            if (!ALLOWED_X.has(x)) {
                fields.xErr = true;
                errors.push("X: допустимы только значения {-5 … 3}.");
                x = null;
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
