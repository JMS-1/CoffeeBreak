/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    export interface IDashboard {
    }

    export class DashboardController extends Controller<IDashboard> {
        onConnect(): void {
        }
    }
}