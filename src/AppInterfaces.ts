'use strict';

module CoffeeBreak {

    export interface IView {
        viewName(): string;

        connect(html: JQuery): void;
    }

    export interface IController {
        onConnect(): void;
    }

    export interface IViewFactory {
        new (): IView;
    }

    export interface IApplication {
        loadView<TViewType>(factory: IViewFactory): void;
    }

}
