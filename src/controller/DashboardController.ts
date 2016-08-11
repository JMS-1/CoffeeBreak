﻿/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export interface IDashboard {
    }

    export class DashboardController extends Controller<IDashboard> {
        private _model = new Dashboard();

        private _me: SP.User;

        onConnect(): void {
            var context = JMS.SharePoint.newExecutor();

            context.user().success(user => {
                this._me = user;
                this.reload();
            });

            context.startAsync();
        }

        private reload(): void {
            var context = JMS.SharePoint.newExecutor();
            var query = new JMS.SharePoint.Query();

            query
                .limit(20)
                .order(Donation.CreatedProperty, false);

            if (this._model.selfOnly && this._me)
                query.equal(Donation.AuthorProperty, this._me.get_id(), true);

            context.items(Donation, query).success(items => {
            });

            context.startAsync();
        }
    }
}