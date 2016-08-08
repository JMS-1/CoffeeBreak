'use strict';

module CoffeeBreak {

    class TheApplication implements IApplication {
        constructor() {
            ExecuteOrDelayUntilScriptLoaded(() => $(() => this.startup()), "sp.js");
        }

        private _spa: JQuery;

        private startup(): void {
            this._spa = $(`#spaContainer`);

            this.loadView(CreateTypeView);
        }

        loadView<TViewType>(factory: IViewFactory): void {
            var view = new factory();

            $.get(`../views/${view.viewName()}.html`, (html: string) => {
                view.connect(this._spa.html(html));
            });
        }
    }

    export var App: IApplication = new TheApplication();

}
