'use strict';

module CoffeeBreak {

    export interface IView {
        viewName(): string;
    }

    export interface IViewFactory {
        new (): IView;
    }

    export interface IApplication {
        loadView<TViewType>(factory: IViewFactory): void;
    }

}
