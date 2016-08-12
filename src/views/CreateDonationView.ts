/// <reference path="FormView.ts" />

'use strict';

module CoffeeBreak {

    export class CreateDonationView extends FormView<ICreateDonation, CreateDonationView, CreateDonationController> implements ICreateDonation {
        viewName(): string {
            return `createDonation`;
        }

        private _type: JQuery;

        private _weight: JQuery;

        private _newType: JQuery;

        private _onTypeChanged: (selected: CoffeeType) => void;

        private _onWeightChanged: (newValue: number, isValid: boolean) => void;

        private _typeMap: { [id: string]: CoffeeType } = {};

        protected onConnect(): void {
            super.onConnect();

            this._type = this.connectSelect(`.coffeeBreakType > select`, selected => this._onTypeChanged && this._onTypeChanged(this._typeMap[selected]));
            this._newType = this.connectAction(`.coffeeBreakType > a`, () => App.loadView(CreateTypeController, CreateTypeView));
            this._newType.prop(`disabled`, true);

            this._weight = this.connectNumber(`.coffeeBreakWeight > input`, (newValue, isValid) => this._onWeightChanged && this._onWeightChanged(newValue, isValid));
        }

        protected close(): void {
            super.close();

            App.activeDonation = undefined;
        }

        activeDonation(model?: Donation): Donation {
            var active = App.activeDonation;

            if (model !== undefined)
                App.activeDonation = model;

            return active;
        }

        setWeight(weight: number, onChange?: (newValue: number, isValid: boolean) => void): void {
            if (onChange)
                this._onWeightChanged = onChange;

            if (weight === undefined)
                this._weight.val(``);
            else
                this._weight.val(weight);
        }

        setWeightError(error: string = ``): void {
            View.setError(this._weight, error);
        }

        setTypes(types: CoffeeType[]): void {
            this._newType.prop(`disabled`, false);

            if (types.length < 1)
                return;

            types.forEach((type, index) => {
                var id = type.id.toString();

                this._type.append(new Option(type.fullName(), id));
                this._typeMap[id] = type;
            });

            this._type.prop(`disabled`, false);
        }

        setType(typeId: number, onChange?: (newValue: CoffeeType) => void): CoffeeType {
            this._onTypeChanged = onChange;

            if (typeId !== undefined)
                this._type.val(typeId);

            return this._typeMap[this._type.val()];
        }

        setTypeError(error: string = ``): void {
            View.setError(this._type, error);
        }
    }
}