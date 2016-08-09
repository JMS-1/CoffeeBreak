'use strict';

module CoffeeBreak {

    class TheApplication implements IApplication {
        constructor() {
            ExecuteOrDelayUntilScriptLoaded(() => $(() => this.startup()), "sp.js");
        }

        private _spa: JQuery;

        private _history: IViewFactory<any>[] = [];

        private startup(): void {
            this._spa = $(`#spaContainer`);

            this.checkSampleData();
        }

        private checkSampleData(): void {
            var context = JMS.SharePoint.newExecutor();

            context.items(CoffeeType).success(types => {
                if (types.length > 0)
                    this.loadView(DashboardView)
                else
                    this.loadSampleData();
            });

            context.startAsync();
        }

        private loadSampleData(): void {
            var context = JMS.SharePoint.newExecutor();

            var type1 = new CoffeeType();
            var type1Id: number;
            type1.company = "Senseo";
            type1.name = "Guten Morgen";
            type1.coffein = true;

            context.createItem(type1).success(item => type1Id = item.id);

            var type2 = new CoffeeType();
            var type2Id: number;
            type2.company = "Jakobs";
            type2.name = "Krönung Light";
            type2.coffein = false;

            context.createItem(type2).success(item => type2Id = item.id).success(item => this.loadView(DashboardView));

            context.startAsync();
        }

        loadView<TViewType extends IView>(factory: IViewFactory<TViewType>): void {
            this._history.push(factory);

            var view = new factory();

            $.get(`../views/${view.viewName()}.html`, (html: string) => {
                view.connect(this._spa.html(html));
            });
        }

        closeView(): void {
            this._history.splice(this._history.length - 1);
            this.loadView(this._history[this._history.length - 1]);
        }
    }

    export var App: IApplication = new TheApplication();

}
