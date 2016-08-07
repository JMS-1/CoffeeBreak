'use strict';

/// <reference path="sp/Context.ts" />

module CoffeeBreak {
    export interface IApplication {
    }

    class TheApplication implements IApplication {
        constructor() {
            ExecuteOrDelayUntilScriptLoaded(() => $(() => this.startup()), "sp.js");
        }

        private startup(): void {
            var context = JMS.SharePoint.Context;

            context
                .loadUser()
                .success(user => $('#message').text(`Hello ${user.get_title()}`))
                .failure(msg => alert(`Failed to get user name. Error: ${msg}`));

            context.execute();
        }
    }

    export var App: IApplication = new TheApplication();
}
