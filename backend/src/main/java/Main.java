import com.fastcgi.FCGIInterface;
import itmo.programming.FastCgiHandler;
import itmo.programming.HistoryRepository;
import itmo.programming.HttpUtil;

import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public final class Main {

    public static void main(String[] args) {
        HistoryRepository history = new HistoryRepository(1000);
        FastCgiHandler handler = new FastCgiHandler(history);

        // Бесконечный цикл обработки FastCGI-запросов
        while (new FCGIInterface().FCGIaccept() >= 0) {
            try {
                Map<String, String> env = systemPropertiesToMap();
                OutputStream out = System.out; // FastCGI stdout

                handler.handle(env, out);

                // Важно: убедиться, что всё отправлено
                System.out.flush();
            } catch (Exception e) {
                // Как минимум не уронить процесс; библиотека ожидает, что процесс живёт дальше
                try {
                    HttpUtil.writeError(System.out, 500, "Внутренняя ошибка сервера");
                    System.out.flush();
                } catch (Exception ignore) {
                    // игнорируем вторичную ошибку записи
                }
            }
        }
    }

    /** Преобразуем System.getProperties() в Map<String,String> для FastCgiHandler */
    private static Map<String, String> systemPropertiesToMap() {
        Properties props = System.getProperties();
        Map<String, String> map = new HashMap<>(props.size());
        for (String name : props.stringPropertyNames()) {
            map.put(name, props.getProperty(name));
        }
        return map;
    }
}