/// <reference path="FormController.ts" />

'use strict';

module CoffeeBreak {

    export interface ICreateType extends IForm {
        setCompanies(companies: string[]): void;

        setCompany(company: string, onChange?: (newValue: string) => void): void;

        setCompanyError(error?: string): void;

        setNames(names: string[]): void;

        setName(name: string, onChange?: (newValue: string) => void): void;

        setNameError(error?: string): void;

        setCoffein(withCoffein: boolean, onChange?: (newValue: boolean) => void): void;

        activeDonation(): Donation;
    }

    export class CreateTypeController extends FormController<ICreateType, CoffeeType> {
        private _companies: { [company: string]: string[] };

        private _existing: string[];

        constructor(view: ICreateType) {
            super(view, CoffeeType);
        }

        onConnect(): void {
            super.onConnect();

            this.view.setCompany(this.model.company, company => {
                this.model.company = company;
                this.refreshNames();
                this.validate();
            });

            this.view.setName(this.model.name, name => {
                this.model.name = name;
                this.validate();
            });

            this.view.setCoffein(this.model.coffein, withCoffein => {
                this.model.coffein = withCoffein;
                this.validate();
            });

            super.loadTypes(items => {
                this._existing = items.map(item => item.fullName().toLocaleLowerCase());

                this._companies = {};

                var companyNames: string[] = [];

                items.forEach(item => {
                    var names = this._companies[item.company];
                    if (!names) {
                        companyNames.push(item.company);

                        this._companies[item.company] = (names = []);
                    }

                    names.push(item.name);
                });

                for (var company of companyNames)
                    this._companies[company].sort();

                companyNames.sort();

                this.view.setCompanies(companyNames);
                this.refreshNames();

                this.validate();
            });

            this.validate();
        }

        protected onSaved(model: CoffeeType): void {
            this.view.activeDonation().typeId = model.id
        }

        private refreshNames(): void {
            this.view.setNames(this._companies[this.model.company || '']);
        }

        private validate(): void {
            var isValid = this.model.validate(error => this.view.setCompanyError(error), error => this.view.setNameError(error));

            if (isValid)
                if (this._existing) {
                    var fullName = this.model.fullName().toLocaleLowerCase();

                    for (var item of this._existing)
                        if (item === fullName) {
                            this.view.setNameError(Constants.validation.duplicateType);

                            isValid = false;

                            break;
                        }
                }
                else
                    isValid = false;

            this.view.setAllowSave(isValid);
        }
    }
}