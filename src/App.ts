'use strict';

module CoffeeBreak {

    class TheApplication implements IApplication {
        constructor() {
            var starter = () => $(() => this.startup());

            if (window[`ExecuteOrDelayUntilScriptLoaded`] === undefined)
                starter();
            else
                ExecuteOrDelayUntilScriptLoaded(starter, `sp.js`);
        }

        activeDonation: Donation;

        private _spa: JQuery;

        private _history: { controller: IControllerFactory<any, any>, view: IViewFactory<any> }[] = [];

        private startup(): void {
            this._spa = $(`#spaContainer`);

            this.loadDashboard();
        }

        private loadDashboard(): void {
            this.loadView(DashboardController, DashboardView);
        }

        private checkSampleData(): void {
            var context = JMS.SharePoint.newExecutor();

            context.items(CoffeeType).success(types => {
                if (types.length > 0)
                    this.loadDashboard();
                else
                    this.loadTypes();
            });

            context.startAsync();
        }

        private loadTypes(): void {
            var context = JMS.SharePoint.newExecutor();

            var type1 = new CoffeeType();
            type1.company = `Senseo`;
            type1.name = `Guten Morgen`;
            type1.coffein = true;

            var type2 = new CoffeeType();
            type2.company = `Jakobs`;
            type2.name = `Krönung Light`;
            type2.coffein = false;

            context.update(type1);
            context.update(type2).success(item => this.loadDonations());

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

            context.update(don1);
            context.update(don2).success(item => this.loadDashboard());

            context.startAsync();
        }

        loadView<TPresenationType extends IPresentation, TViewType extends TPresenationType, TControllerType extends IController<TPresenationType>>(controllerFactory: IControllerFactory<TControllerType, TPresenationType>, viewFactory: IViewFactory<View<TPresenationType, TViewType, TControllerType>>): void {
            this._history.push({ controller: controllerFactory, view: viewFactory });

            var view = new viewFactory();
            var controller = new controllerFactory(<TPresenationType><IPresentation>view);

            $.get(`../views/${view.viewName()}.html`, (html: string) => {
                view.connect(this._spa.html(html));
            });
        }

        closeView(): void {
            var tos = this._history.splice(this._history.length - 2)[0];

            this.loadView(tos.controller, tos.view);
        }
    }

    export var App: IApplication = new TheApplication();

}
