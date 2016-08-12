'use strict';

module CoffeeBreak {

    // Schnittstelle für einen View.
    export interface IView {
        // Der Name der zugehörigen HTML Datei.
        viewName(): string;

        // Wird aufgerufen, sobald das HTML in die SPA eingefügt wurde.
        connect(html: JQuery): void;
    }

    // Schnittstelle zum Anlegen eines Views.
    export interface IViewFactory<TViewType extends IView> extends JMS.SharePoint.IFactory0<TViewType> {
    }

    // Schnittstelle zum Anlegen eines Controllers.
    export interface IControllerFactory<TControllerType extends IController<TPresentationType>, TPresentationType extends IPresentation> extends JMS.SharePoint.IFactory1<TControllerType, TPresentationType> {
    }

    // Nur diese Methoden werden von der SPA global angeboten.
    export interface IApplication {
        // Zeigt einen neuen View an.
        loadView<TPresentationType extends IPresentation, TViewType extends TPresentationType, TControllerType extends IController<TPresentationType>>(controllerFactory: IControllerFactory<TControllerType, TPresentationType>, viewFactory: IViewFactory<View<TPresentationType, TViewType, TControllerType>>): void;

        // Schließt den aktuellen View und kehrt zum vorherigen zurück.
        closeView(): void;

        // Optional die aktuell gepflegte Spende.
        activeDonation: Donation;
    }

}
