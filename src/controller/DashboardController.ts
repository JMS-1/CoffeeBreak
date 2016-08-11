/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export interface IDashboard {
    }

    export class DashboardController extends Controller<IDashboard> {
        private _me: SP.User;

        onConnect(): void {
            var context = JMS.SharePoint.newExecutor();
            var query = new JMS.SharePoint.Query();

            context.user().success(user => this._me = user);

            query
                .limit(20)
                .order(Donation.CreatedProperty, false);

            context.items(Donation, query).success(items => {
            });

            context.startAsync();
        }
    }
}