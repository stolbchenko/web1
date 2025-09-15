package itmo.programming;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Утилиты для отправки JSON-ответов через FastCGI.
 */
public final class HttpUtil {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule()); // Instant/LocalDateTime и т.п.

    private HttpUtil() {}

    /** Пишет успешный JSON-ответ (HTTP 200). */
    public static void writeJsonOk(OutputStream out, Object body) throws IOException {
        byte[] payload = MAPPER.writeValueAsBytes(body);
        writeHeaders(out, 200, "OK", "application/json; charset=utf-8", payload.length);
        out.write(payload);
    }

    /** Пишет JSON-ошибку с заданным статусом (например, 400/422/500). */
    public static void writeError(OutputStream out, int code, String message) throws IOException {
        byte[] payload = MAPPER.writeValueAsBytes(Map.of("error", message));
        writeHeaders(out, code, statusText(code), "application/json; charset=utf-8", payload.length);
        out.write(payload);
    }

    private static void writeHeaders(OutputStream out,
                                     int statusCode,
                                     String reason,
                                     String contentType,
                                     int contentLength) throws IOException {
        String headers =
                "Status: " + statusCode + " " + reason + "\r\n" +
                        "Content-Type: " + contentType + "\r\n" +
                        "Cache-Control: no-store\r\n" +
                        (contentLength >= 0 ? "Content-Length: " + contentLength + "\r\n" : "") +
                        "\r\n";
        out.write(headers.getBytes(StandardCharsets.UTF_8));
    }

    private static String statusText(int code) {
        return switch (code) {
            case 200 -> "OK";
            case 400 -> "Bad Request";
            case 401 -> "Unauthorized";
            case 403 -> "Forbidden";
            case 404 -> "Not Found";
            case 422 -> "Unprocessable Entity";
            case 500 -> "Internal Server Error";
            default -> "";
        };
    }
}
