/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export interface ICreateDonation {
        setType(type: string, onChange?: (newValue: CoffeeType) => void): void;

        setTypes(types: CoffeeType[]): void;

        getNewlyCreatedType(): CoffeeType;
    }

    export class CreateDonationController extends Controller<ICreateDonation> {
        private _model = new Donation();

        onConnect(): void {
            var newlyCreatedType = this.view.getNewlyCreatedType();
            
            if (newlyCreatedType) {
                this._model.typeId = newlyCreatedType.id;
                this._model.typeName = newlyCreatedType.fullName();
            }

            var query = JMS.SharePoint.newExecutor();

            query.items(CoffeeType).success(items => {
                items.sort();

                this.view.setTypes(items);
                this.view.setType(this._model.typeName, newType => {
                    this._model.typeId = newType.id;
                    this._model.typeName = newType.fullName();

                    this.validate();
                });
            });

            query.startAsync();
        }

        private validate(): void {
        }
    }

}