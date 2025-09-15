// /web/js/app.js
(function () {
    const { qs } = window.DOM;
    const { FormView, ErrorView, TableView, GraphView } = window.Views;

    document.addEventListener("DOMContentLoaded", () => {
        const formView   = FormView("#point-form");
        const errorView  = ErrorView("#errors");
        const tableView  = TableView("#history");
        const graphView  = GraphView("#graph"); // можно не использовать, если не нужно

        // Первичная отрисовка локальной истории
        const initialHistory = HistoryStore.load();
        tableView.render(initialHistory);

        // Обработчик сабмита формы
        formView.onSubmit(async () => {
            // Чистим прошлые ошибки/подсветку
            errorView.clear();
            formView.highlightErrors({ yErr: false, rErr: false });

            // Валидируем
            const formEl = formView.el;
            const v = window.FormValidator.validate(formEl);

            // Подсветка полей с ошибками
            formView.highlightErrors(v.fields);

            if (!v.ok) {
                errorView.show(v.errors);
                return;
            }

            // Отправляем нормализованные значения
            const resp = await window.ApiClient.getCheck({
                x: v.x,
                y: v.y.toString(),
                r: v.r.toString()
            });

            if (resp && resp.error) {
                errorView.show([resp.error]);
                return;
            }

            // Обновляем историю из ответа сервера
            const merged = HistoryStore.merge(resp.history || []);
            tableView.render(merged);

            // (Опционально) перерисуем область и точку на графике
            try {
                graphView.drawArea(v.r.toString());
                graphView.plotPoint(Number(v.x), Number(v.y.toString()));
            } catch {
                // график — необязательный; ошибки игнорируем, чтобы не ломать UX
            }
        });
    });
})();
