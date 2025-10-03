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
                OutputStream out = System.out;

                handler.handle(env, out);

                System.out.flush();
            } catch (Exception e) {

                try {
                    HttpUtil.writeError(System.out, 500, "Внутренняя ошибка сервера");
                    System.out.flush();
                } catch (Exception ignore) {
                }
            }
        }
    }

    private static Map<String, String> systemPropertiesToMap() {
        Properties props = System.getProperties();
        Map<String, String> map = new HashMap<>(props.size());
        for (String name : props.stringPropertyNames()) {
            map.put(name, props.getProperty(name));
        }
        return map;
    }
}