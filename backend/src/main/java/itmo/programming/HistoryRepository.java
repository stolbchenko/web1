package itmo.programming;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public final class HistoryRepository {

    private final int limit;
    private final CopyOnWriteArrayList<Result> data = new CopyOnWriteArrayList<>();

    public HistoryRepository(int limit) {
        if (limit <= 0) throw new IllegalArgumentException("Лимит должен быть больше 0");
        this.limit = limit;
    }

    public HistoryRepository() {
        this(1000);
    }

    public void add(Result r) {
        if (r == null) return;
        synchronized (this) {
            data.add(r);
            while (data.size() > limit) {
                data.remove(0);
            }
        }
    }

    public List<Result> findAll() {
        return List.copyOf(data);
    }

    public void clear() {
        data.clear();
    }

    public int size() {
        return data.size();
    }

    public int limit() {
        return limit;
    }
}
