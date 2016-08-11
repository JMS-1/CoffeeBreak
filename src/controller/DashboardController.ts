/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export interface IDashboard {
    }

    export class DashboardController extends Controller<IDashboard> {
        private _me: SP.User;

        onConnect(): void {
            var context = JMS.SharePoint.newExecutor();

            context.user().success(user => this._me = user);
            context.items(Donation).success(items => {
            });

            context.startAsync();
        }
    }
}