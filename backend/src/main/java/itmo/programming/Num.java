package itmo.programming;

import java.math.BigDecimal;
import java.math.MathContext;

public class Num {

    public static MathContext MC = MathContext.DECIMAL128;

    private Num() {}

    public static BigDecimal parseBig(String raw, String name) {
        if (raw == null) {
            throw new IllegalArgumentException(name + ": параметр отсутствует");
        }
        final String s = raw.trim().replace(',', '.');
        try {
            return new BigDecimal(s);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(name + ": введите число");
        }
    }

    public static void require(boolean cond, String msg) {
        if (!cond) throw new IllegalArgumentException(msg);
    }
}
