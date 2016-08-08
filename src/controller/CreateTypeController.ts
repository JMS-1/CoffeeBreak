/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export class CreateTypeController extends Controller<ICreateTypeView> {
        private _model = new CoffeeType();

        constructor(view: ICreateTypeView) {
            super(view);

            view.onCompanyChanged = company => {
                this._model.company = company;
            }
        }

        public onConnect(): void {
            this.view.setCompany(this._model.company);
        }
    }
}