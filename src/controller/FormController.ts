/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export interface ITypedFormController<TViewInterface extends IForm> extends ITypedController<TViewInterface> {
    }

    export interface IForm {
        setAllowSave(enable: boolean): void;

        setSave(save: (done: (success: boolean) => void) => void): void;
    }

    export abstract class FormController<TViewInterface extends IForm, TModelType extends Model> extends Controller<TViewInterface> implements ITypedFormController<TViewInterface> {
        protected model: TModelType;

        constructor(view: TViewInterface, factory: JMS.SharePoint.IModelFactory<TModelType>) {
            super(view);

            this.model = new factory();
        }

        onConnect(): void {
            this.view.setSave(done => {
                this.view.setAllowSave(false);

                var executor = JMS.SharePoint.newExecutor();

                executor
                    .createItem(this.model)
                    .success(model => this.onSaved(model))
                    .success(model => done(true))
                    .failure(message => done(false));

                executor.startAsync();
            });
        }

        protected onSaved(model: TModelType): void {
        }

        protected loadTypes(process: (types: CoffeeType[]) => void): void {
            var query = JMS.SharePoint.newExecutor();

            query.items(CoffeeType).success(process);

            query.startAsync();
        }
    }

}