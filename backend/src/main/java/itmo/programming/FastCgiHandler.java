package itmo.programming;

import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;


public final class FastCgiHandler {

    private final HistoryRepository history;

    public FastCgiHandler(HistoryRepository history) {
        this.history = history;
    }

    public void handle(Map<String, String> env, OutputStream out) {
        var timer = ClockTimer.start();
        try {
            // 1. Разбор query string
            Map<String, String> params = parseQuery(env.getOrDefault("QUERY_STRING", ""));

            // 2. Валидация входных
            Inputs in = Validator.validate(params.get("x"), params.get("y"), params.get("r"));

            // 3. Проверка попадания
            boolean hit = PointChecker.isHit(
                    new BigDecimal(in.x()), in.y(), in.r()
            );

            // 4. Создание результата
            var now = Instant.now();
            var elapsed = timer.elapsedMillis();
            Result result = new Result(in.x(), in.y(), in.r(), hit, now, elapsed);

            // 5. Сохранение в историю
            history.add(result);

            // 6. Формирование ответа
            var resp = Map.of(
                    "now", now,
                    "execTimeMs", elapsed,
                    "input", Map.of("x", in.x(), "y", in.y(), "r", in.r()),
                    "hit", hit,
                    "history", history.findAll()
            );

            HttpUtil.writeJsonOk(out, resp);

        } catch (IllegalArgumentException e) {
            safeError(out, 400, e.getMessage());
        } catch (Exception e) {
            safeError(out, 500, "Внутренняя ошибка сервера");
        }
    }

    private static Map<String, String> parseQuery(String qs) {
        Map<String, String> map = new HashMap<>();
        for (String part : qs.split("&")) {
            if (part.isBlank()) continue;
            String[] kv = part.split("=", 2);
            String key = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
            String val = kv.length > 1 ? URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "";
            map.put(key, val);
        }
        return map;
    }

    private static void safeError(OutputStream out, int code, String msg) {
        try {
            HttpUtil.writeError(out, code, msg);
        } catch (Exception ignore) {
        }
    }
}
