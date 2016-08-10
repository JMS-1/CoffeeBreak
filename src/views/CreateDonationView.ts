/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export class CreateDonationView extends View<ICreateDonation, CreateDonationView, CreateDonationController> implements ICreateDonation {
        viewName(): string {
            return 'createDonation';
        }

        private _type: JQuery;

        private _weight: JQuery;

        private _save: JQuery;

        private _cancel: JQuery;

        private _newType: JQuery;

        private _onTypeChanged: (selected: CoffeeType) => void;

        private _onWeightChanged: (newValue: number, isValid: boolean) => void;

        private _onSave: (done: (success: boolean) => void) => void;

        private _typeMap: { [id: string]: CoffeeType } = {};

        constructor() {
            super(CreateDonationController);
        }

        protected onConnect(): void {
            this._type = super.connectSelect(`.coffeeBreakType > select`, selected => this._onTypeChanged && this._onTypeChanged(this._typeMap[selected]));
            this._newType = super.connectAction(`.coffeeBreakType > a`, () => App.loadView(CreateTypeView));
            this._newType.prop(`disabled`, true);

            this._weight = super.connectNumber(`.coffeeBreakWeight > input`, (newValue, isValid) => this._onWeightChanged && this._onWeightChanged(newValue, isValid));

            this._cancel = super.connectAction(`a.coffeeBreakCancel`, () => this.close());
            this._save = super.connectAction(`a.coffeeBreakSave`, () => this._onSave && this._onSave(success => {
                if (success)
                    super.close();
            }));

            this.setAllowSave(false);
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

        setSave(save: (done: (success: boolean) => void) => void): void {
            this._onSave = save;
        }

        setAllowSave(enable: boolean): void {
            if (enable)
                this._save.button('enable');
            else
                this._save.button('disable');
        }

        setWeight(weight: number, onChange?: (newValue: number, isValid: boolean) => void): void {
            if (onChange)
                this._onWeightChanged = onChange;

            if (weight === undefined)
                this._weight.val(``);
            else
                this._weight.val(weight);
        }

        setWeightError(error: string = ''): void {
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

        setTypeError(error: string = ''): void {
            View.setError(this._type, error);
        }
    }
}