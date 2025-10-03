package itmo.programming;

import java.math.BigDecimal;
import java.time.Instant;

public final class ClockTimer {

    private ClockTimer() {}

    public static Instant now() {
        return Instant.now();
    }

    public static Timer start() {
        return new Timer();
    }

    public static final class Timer {
        private final long startedNs = System.nanoTime();

        public BigDecimal elapsedMillis() {
            long deltaNs = System.nanoTime() - startedNs;
            return new BigDecimal(deltaNs).divide(new BigDecimal("1000000"), Num.MC);
        }
    }
}
