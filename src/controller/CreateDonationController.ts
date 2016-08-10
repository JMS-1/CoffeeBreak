/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export interface ICreateDonation {
        setType(typeId: number, onChange?: (newValue: CoffeeType) => void): CoffeeType;

        setTypes(types: CoffeeType[]): void;

        getNewlyCreatedType(): CoffeeType;
    }

    export class CreateDonationController extends Controller<ICreateDonation> {
        private _model = new Donation();

        onConnect(): void {
            var newlyCreatedType = this.view.getNewlyCreatedType();

            if (newlyCreatedType)
                this._model.typeId = newlyCreatedType.id;

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
        }
    }

}