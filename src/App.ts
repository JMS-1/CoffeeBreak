'use strict';

module CoffeeBreak {

    // Die Steuerung der SPA.
    class TheApplication implements IApplication {
        constructor() {
            var starter = () => $(() => {
                // An die Oberfläche binden.
                this._spa = $(`#spaContainer`);

                // Startseite laden.
                this.loadView(DashboardController, DashboardView);
            });

            // Man beachte hier, dass ein Stand-Alone aufruf (ExecuteOrDelayUntilScriptLoaded) etwas anders verläuft als beim Einbetten eines Client Web Parts in eine SharePoint Seite.
            if (window[`ExecuteOrDelayUntilScriptLoaded`] === undefined)
                starter();
            else
                ExecuteOrDelayUntilScriptLoaded(starter, `sp.js`);
        }

        // Optional die aktuell bearbeitete Spende.
        activeDonation: Donation;

        // Das Oberflächenelement (DIV) der SPA.
        private _spa: JQuery;

        // Die Liste der gerade aktiven Views.
        private _history: { controller: IControllerFactory<any, any>, view: IViewFactory<any> }[] = [];

        // Lädt einen neuen View.
        loadView<TPresentationType extends IPresentation, TViewType extends TPresentationType, TControllerType extends IController<TPresentationType>>(controllerFactory: IControllerFactory<TControllerType, TPresentationType>, viewFactory: IViewFactory<View<TPresentationType, TViewType, TControllerType>>): void {
            // Informationen zum Erzeugen dieses Views merken.
            this._history.push({ controller: controllerFactory, view: viewFactory });

            // View anlegen.
            var view = new viewFactory();

            // Controller anlegen - der Down-Cast ist etwas komisch, geht aber nicht anders, da TypeScript in Generic Constraints kein multiples extends unterstützt.
            var controller = new controllerFactory(<TPresentationType><IPresentation>view);

            // HTML Seite jedesmal neu laden und den View initialisieren - ja, produktiv wäre eine Vorhaltung angesagt.
            $.get(`../views/${view.viewName()}.html`, (html: string) => view.connect(this._spa.html(html)));
        }

        // Schließt den aktuellen View und öffnet den vorherigen.
        closeView(): void {
            // Liste der aktiven Views entsprechend bereinigen - ja, -2 und [0] ist in Ordnung, da wir den vorherigen View neu erzeugen.
            var tos = this._history.splice(this._history.length - 2)[0];

            // Vorhgerigen View ganz neu laden - man beachte, dass dieser dann ohne Zustand startet, daher auch die aktuelle Spende als Zustand der SPA!
            this.loadView(tos.controller, tos.view);
        }
    }

    // Bietet Steuerungmethoden für die Gesamtanwendung an.
    export var App: IApplication = new TheApplication();

}
