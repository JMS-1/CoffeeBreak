/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export interface ICreateDonation {
        setTypes(types: CoffeeType[]): void;

        setType(typeId: number, onChange?: (newValue: CoffeeType) => void): CoffeeType;

        setTypeError(error?: string): void;

        setWeight(weight: number, onChange?: (newValue: number, isValid: boolean) => void): void;

        setWeightError(error?: string): void;

        setAllowSave(enable: boolean): void;

        setSave(save: (done: (success: boolean) => void) => void): void;

        activeDonation(model?: Donation): Donation;
    }

    export class CreateDonationController extends Controller<ICreateDonation> {
        private _model = new Donation();

        private _hasValidWeight = true;

        onConnect(): void {
            var active = this.view.activeDonation();
            if (active)
                this._model = active;
            else
                this.view.activeDonation(this._model);

            this.view.setWeight(this._model.weight, (newValue, isValid) => {
                this._hasValidWeight = isValid;
                this._model.weight = newValue;

                this.validate();
            });

            this.view.setSave(done => {
                this.view.setAllowSave(false);

                var executor = JMS.SharePoint.newExecutor();

                executor
                    .createItem(this._model)
                    .success(model => done(true))
                    .failure(message => done(false));

                executor.startAsync();
            });

            var query = JMS.SharePoint.newExecutor();

            query.items(CoffeeType).success(items => {
                items.sort();

                this.view.setTypes(items);

                var activeType = this.view.setType(this._model.typeId, newType => {
                    this._model.typeId = newType.id;

                    this.validate();
                });

                if (activeType)
                    this._model.typeId = activeType.id;

                this.validate();
            });

            query.startAsync();

            this.validate();
        }

        private validate(): void {
            var isValid = this._model.validate(error => this.view.setTypeError(error), error => this.view.setWeightError(error));

            if (!this._hasValidWeight) {
                this.view.setWeightError(Constants.validation.badNumber);

                isValid = false;
            }

            this.view.setAllowSave(isValid);
        }
    }

}