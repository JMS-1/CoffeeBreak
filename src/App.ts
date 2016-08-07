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
            var context = SP.ClientContext.get_current();
            var user = context.get_web().get_currentUser();

            context.load(user);
            context.executeQueryAsync(
                () => $('#message').text('Hello ' + user.get_title()),
                (s, a) => alert('Failed to get user name. Error:' + a.get_message()));
        }
    }

    export var App: IApplication = new TheApplication();
}
