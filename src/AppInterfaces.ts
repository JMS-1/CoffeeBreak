'use strict';

module CoffeeBreak {

    export interface IView {
        viewName(): string;

        connect(html: JQuery): void;
    }

    export interface IViewFactory<TViewType extends IView> extends JMS.SharePoint.IFactory0<TViewType> {
    }

    export interface IApplication {
        loadView<TViewType extends IView>(factory: IViewFactory<TViewType>): void;

        closeView(): void;

        activeDonation: Donation;
    }

}
