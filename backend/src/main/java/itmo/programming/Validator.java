package itmo.programming;

import java.math.BigDecimal;
import java.util.Set;

public class Validator {

    private static final Set<Integer> ALLOWED_X = Set.of(-5, -4, -3, -2, -1, 0, 1, 2, 3);

    private static final BigDecimal MIN_Y = new BigDecimal("-5");
    private static final BigDecimal MAX_Y = new BigDecimal("5");

    private static final BigDecimal MIN_R = new BigDecimal("2");
    private static final BigDecimal MAX_R = new BigDecimal("5");

    private Validator() {

    }

    public static Inputs validate(String xStr, String yStr, String rStr) {
        int x;
        try {
            x = Integer.parseInt(xStr);
        } catch (Exception e) {
            throw new IllegalArgumentException("Ошибка x: выберите значение из строгого набора"
                    + "{-5 ... 3}");
        }
        if(!ALLOWED_X.contains(x)) {
            throw new IllegalArgumentException("Ошибка x: допустимо значение из строгого набора цифр"
                    + "{-5 ... 3}");
        }

        BigDecimal y = Num.parseBig(yStr, "Y");
        Num.require(y.compareTo(MIN_Y) > 0 && y.compareTo(MAX_Y) < 0,
                "Ошибка y: допустимо значение из диапазона (-5; 5)");

        BigDecimal r = Num.parseBig(rStr, "R");
        Num.require(r.compareTo(MIN_R) > 0 && r.compareTo(MAX_R) < 0,
                "Ошибка r: допустимо значение из диапазона (2; 5)");

        return new Inputs(x, y, r);
    }
}
