package itmo.programming;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Результат одной проверки попадания точки.
 */
public record Result(
        int x,                 // выбранный X (radio)
        BigDecimal y,          // введённый Y
        BigDecimal r,          // введённый R
        boolean hit,           // попала ли точка в область
        Instant at,            // текущее время на сервере
        BigDecimal execTimeMs  // время работы скрипта в мс (BigDecimal)
) {}