'use strict';

module CoffeeBreak {

    export interface IView {
        viewName(): string;

        connect(html: JQuery): void;
    }

    export interface IController {
        onConnect(): void;
    }

    export interface ITypedController<TViewInterface> extends IController {
    }

    export interface IViewFactory<TViewType extends IView> {
        new (): TViewType;
    }

    export interface IApplication {
        loadView<TViewType extends IView>(factory: IViewFactory<TViewType>): void;

        closeView(): void;

        activeDonation: Donation;
    }

}
