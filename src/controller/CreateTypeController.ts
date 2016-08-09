/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export class CreateTypeController extends Controller<ICreateTypeView> {
        private _model = new CoffeeType();

        onConnect(): void {
            this.view.setCompany(this._model.company, company => {
                this._model.company = company;
                this.validate();
            });

            this.view.setName(this._model.name, name => {
                this._model.name = name;
                this.validate();
            });

            this.view.setCoffein(this._model.coffein, withCoffein => {
                this._model.coffein = withCoffein;
                this.validate();
            });
        }

        private validate(): void {
        }
    }
}