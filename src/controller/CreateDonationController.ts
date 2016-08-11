/// <reference path="FormController.ts" />

'use strict';

module CoffeeBreak {

    export interface ICreateDonation extends IForm {
        setTypes(types: CoffeeType[]): void;

        setType(typeId: number, onChange?: (newValue: CoffeeType) => void): CoffeeType;

        setTypeError(error?: string): void;

        setWeight(weight: number, onChange?: (newValue: number, isValid: boolean) => void): void;

        setWeightError(error?: string): void;

        activeDonation(model?: Donation): Donation;
    }

    export class CreateDonationController extends FormController<ICreateDonation, Donation> {
        private _hasValidWeight = true;

        constructor(view: ICreateDonation) {
            super(view, Donation);
        }

        onConnect(): void {
            super.onConnect();

            var active = this.view.activeDonation();
            if (active)
                this.model = active;
            else
                this.view.activeDonation(this.model);

            this.view.setWeight(this.model.weight, (newValue, isValid) => {
                this._hasValidWeight = isValid;
                this.model.weight = newValue;

                this.validate();
            });

            this.loadTypes(items => {
                items.sort();

                this.view.setTypes(items);

                var activeType = this.view.setType(this.model.typeId, newType => {
                    this.model.typeId = newType.id;

                    this.validate();
                });

                if (activeType)
                    this.model.typeId = activeType.id;

                this.validate();
            });

            this.validate();
        }

        private validate(): void {
            var isValid = this.model.validate(error => this.view.setTypeError(error), error => this.view.setWeightError(error));

            if (!this._hasValidWeight) {
                this.view.setWeightError(Constants.validation.badNumber);

                isValid = false;
            }

            this.view.setAllowSave(isValid);
        }
    }

}