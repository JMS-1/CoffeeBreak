/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export interface ICreateType {
        setCompany(company: string, onChange?: (newValue: string) => void): void;

        setCompanyError(error?: string): void;

        setName(name: string, onChange?: (newValue: string) => void): void;

        setNameError(error?: string): void;

        setCoffein(withCoffein: boolean, onChange?: (newValue: boolean) => void): void;

        setSave(enable: boolean): void;

        setCompanies(companies: string[]): void;

        setNames(names: string[]): void;
    }

    export class CreateTypeController extends Controller<ICreateType> {
        private _model = new CoffeeType();

        private _companies: { [company: string]: string[] };

        private _existing: CoffeeType[];

        onConnect(): void {
            this.validate();

            this.view.setCompany(this._model.company, company => {
                this._model.company = company;
                this.refreshNames();
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

            var query = JMS.SharePoint.newExecutor();

            query.items(CoffeeType).success(items => {
                this._existing = items;
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

            query.startAsync();
        }

        private refreshNames(): void {
            this.view.setNames(this._companies[this._model.company || '']);
        }

        private validate(): void {
            var isValid = this._model.validate(error => this.view.setCompanyError(error), error => this.view.setNameError(error));

            if (isValid)
                if (this._companies) {
                }
                else
                    isValid = false;

            this.view.setSave(isValid);
        }
    }
}