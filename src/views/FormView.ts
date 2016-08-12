/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export abstract class FormView<TViewInterface extends IForm, TViewType extends TViewInterface, TControllerType extends ITypedFormController<TViewInterface>> extends View<TViewInterface, TViewType, TControllerType> implements IForm {
        private _save: JQuery;

        private _cancel: JQuery;

        private _onSave: (done: (success: boolean) => void) => void;

        constructor(factory: JMS.SharePoint.IFactory1<TControllerType, TViewType>) {
            super(factory);
        }

        protected onConnect(): void {
            this._cancel = this.connectAction(`a.coffeeBreakCancel`, () => this.close());
            this._save = this.connectAction(`a.coffeeBreakSave`, () => this._onSave && this._onSave(success => {
                if (success)
                    this.close();
            }));

            this.setAllowSave(false);
        }

        setSave(save: (done: (success: boolean) => void) => void): void {
            this._onSave = save;
        }

        setAllowSave(enable: boolean): void {
            if (enable)
                this._save.button(`enable`);
            else
                this._save.button(`disable`);
        }
    }

}