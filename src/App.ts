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
                    this.loadTypes();
            });

            context.startAsync();
        }

        private loadTypes(): void {
            var context = JMS.SharePoint.newExecutor();

            var type1 = new CoffeeType();
            type1.company = "Senseo";
            type1.name = "Guten Morgen";
            type1.coffein = true;

            var type2 = new CoffeeType();
            type2.company = "Jakobs";
            type2.name = "Krönung Light";
            type2.coffein = false;

            context.createItem(type1);
            context.createItem(type2).success(item => this.loadDonations());

            context.startAsync();
        }

        private loadDonations(): void {
            var context = JMS.SharePoint.newExecutor();

            var don1 = new Donation();
            don1.typeId = 1;
            don1.weight = 500;

            var don2 = new Donation();
            don2.typeId = 2;
            don2.weight = 250;

            context.createItem(don1);
            context.createItem(don2).success(item => this.loadView(DashboardView));

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
