/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export class CreateDonationView extends View<ICreateDonation, CreateDonationView, CreateDonationController> implements ICreateDonation {
        viewName(): string {
            return 'createDonation';
        }

        private _type: JQuery;

        private _cancel: JQuery;

        private _newType: JQuery;

        private _onTypeChanged: (selected: CoffeeType) => void;

        private _typeMap: { [id: string]: CoffeeType } = {};

        constructor() {
            super(CreateDonationController);
        }

        protected onConnect(): void {
            this._type = super.connectSelect(`.coffeeBreakType > select`, selected => this._onTypeChanged && this._onTypeChanged(this._typeMap[selected]));

            this._cancel = super.connectAction(`a.coffeeBreakCancel`, () => this.close());
            this._newType = super.connectAction(`.coffeeBreakType > input[type="BUTTON"]`, () => App.loadView(CreateTypeView));

            this._newType.prop(`disabled`, true);
        }

        protected close(): void {
            App.newlyCreatedType = undefined;

            super.close();
        }

        getNewlyCreatedType(): CoffeeType {
            return App.newlyCreatedType;
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

            this._type.selectmenu(`refresh`);
            this._type.selectmenu(`enable`);
        }

        setType(typeId: number, onChange?: (newValue: CoffeeType) => void): CoffeeType {
            this._onTypeChanged = onChange;

            if (typeId !== undefined)
                this._type.val(typeId);

            return this._typeMap[this._type.val()];
        }
    }
}