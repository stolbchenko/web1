package itmo.programming;

import java.math.BigDecimal;
import java.math.MathContext;

public final class PointChecker {

    private static final MathContext MC = Num.MC;
    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal TWO  = new BigDecimal("2");

    private PointChecker() {

    }

    public static boolean isHit(BigDecimal x, BigDecimal y, BigDecimal r) {
        return inQuarterCircle(x, y, r)
                || inRectangle(x, y, r)
                || inTriangle(x, y, r);
    }

    private static boolean inQuarterCircle(BigDecimal x, BigDecimal y, BigDecimal r) {
        if (x.compareTo(ZERO) > 0 || y.compareTo(ZERO) < 0) {
            return false;
        }
        BigDecimal xsq = x.multiply(x, MC);
        BigDecimal ysq = y.multiply(y, MC);
        BigDecimal rsq = r.multiply(r, MC);
        return xsq.add(ysq, MC).compareTo(rsq) <= 0;
    }

    private static boolean inRectangle(BigDecimal x, BigDecimal y, BigDecimal r) {
        BigDecimal rHalf = r.divide(TWO, MC);
        if (x.compareTo(ZERO) < 0 || x.compareTo(rHalf) > 0) {
            return false;
        }
        return y.compareTo(r.negate()) >= 0 && y.compareTo(ZERO) <= 0;
    }

    private static boolean inTriangle(BigDecimal x, BigDecimal y, BigDecimal r) {
        if (x.compareTo(ZERO) > 0 || y.compareTo(ZERO) > 0) {
            return false;
        }
        BigDecimal rhs = x.negate().subtract(r.divide(TWO, MC), MC);
        return y.compareTo(rhs) >= 0;
    }
}
