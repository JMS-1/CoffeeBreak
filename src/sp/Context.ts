'use strict';

module JMS.SharePoint {
    export interface IContext {        
    }

    class TheContext implements IContext {
    }

    export var Context: IContext = new TheContext();
}