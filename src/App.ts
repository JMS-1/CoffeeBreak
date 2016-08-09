'use strict';

module CoffeeBreak {

    class TheApplication implements IApplication {
        constructor() {
            ExecuteOrDelayUntilScriptLoaded(() => $(() => this.startup()), "sp.js");
        }

        private _spa: JQuery;

        private startup(): void {
            this._spa = $(`#spaContainer`);

            this.loadSampleData();
        }

        private loadSampleData(): void {
            var context = JMS.SharePoint.newExecutor();

            var type1 = new CoffeeType();
            type1.company = "Senseo";
            type1.name = "Guten Morgen";
            type1.coffein = true;

            context.createItem(type1);

            var type2 = new CoffeeType();
            type2.company = "Jakobs";
            type2.name = "Krönung Light";
            type2.coffein = false;

            context.createItem(type2).success(item => this.loadView(CreateTypeView));

            context.startAsync();
        }

        loadView<TViewType extends IView>(factory: IViewFactory<TViewType>): void {
            var view = new factory();

            $.get(`../views/${view.viewName()}.html`, (html: string) => {
                view.connect(this._spa.html(html));
            });
        }
    }

    export var App: IApplication = new TheApplication();

}
