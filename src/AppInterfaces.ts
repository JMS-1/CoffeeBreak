'use strict';

module CoffeeBreak {

    export interface IView {
        viewName(): string;

        connect(html: JQuery): void;
    }

    export interface IViewFactory<TViewType extends IView> extends JMS.SharePoint.IFactory0<TViewType> {
    }

    export interface IControllerFactory<TControllerType extends IController<TViewInterface>, TViewInterface extends IPresentation> extends JMS.SharePoint.IFactory1<TControllerType, TViewInterface> {
    }

    export interface IApplication {
        loadView<TPresenationType extends IPresentation, TViewType extends TPresenationType, TControllerType extends IController<TPresenationType>>(controllerFactory: IControllerFactory<TControllerType, TPresenationType>, viewFactory: IViewFactory<View<TPresenationType, TViewType, TControllerType>>): void;

        closeView(): void;

        activeDonation: Donation;
    }

}
