// /web/js/app.js
(function () {
  const { qs } = window.DOM;
  const { FormView, ErrorView, TableView } = window.Views;

  document.addEventListener('DOMContentLoaded', () => {
    const formView  = FormView('#point-form');
    const errorView = ErrorView('#errors');
    const tableView = TableView('#history');


    try {
      const initial = HistoryStore.load();
      tableView.render(initial);
    } catch {  }

    formView.onSubmit(async () => {
      // сброс ошибок и подсветки
      errorView.clear();
      formView.highlightErrors({ yErr: false, rErr: false });

      // валидация формы (с запятой вместо точки и Decimal)
      const v = window.FormValidator.validate(formView.el);
      formView.highlightErrors(v.fields);
      if (!v.ok) {
        errorView.show(v.errors);
        return;
      }

      // запрос к FastCGI серверу
      let resp;
      try {
        resp = await window.ApiClient.getCheck({
          x: v.x,
          y: v.y.toString(),
          r: v.r.toString()
        });
      } catch (e) {
        errorView.show(['Сетевая ошибка. Попробуйте ещё раз.']);
        return;
      }

      if (resp && resp.error) {
        errorView.show([resp.error]);
        return;
      }


      let historyToRender = [];
      if (Array.isArray(resp.history)) {
        historyToRender = resp.history;
      } else if (resp) {
        const row = {
          x: resp?.input?.x,
          y: resp?.input?.y,
          r: resp?.input?.r,
          hit: !!resp?.hit,
          at: resp?.now || resp?.at,
          execTimeMs: resp?.execTimeMs
        };
        // если в ответе есть валидные поля — отрисуем одну строку
        if (row.x != null && row.y != null && row.r != null) {
          historyToRender = [row];
        }
      }
      tableView.render(historyToRender);

      if (Array.isArray(resp.history)) {
        try { HistoryStore.save(resp.history); } catch {}
      }

    });
  });
})();
