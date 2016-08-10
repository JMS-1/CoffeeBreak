'use strict';

module JMS.SharePoint {
    export interface IResult<TResponseType> {
        success(callback: (response: TResponseType) => void): IResult<TResponseType>;

        failure(callback: (message: string) => void): IResult<TResponseType>;
    }

    export interface IExecutionResult<TResponseType extends SP.ClientObject> {
        request: TResponseType;

        success(callback: (response: TResponseType) => void): IExecutionResult<TResponseType>;

        failure(callback: (message: string) => void): IExecutionResult<TResponseType>;
    }

    export interface ISerializableClass {
        listName: string;
    }

    export interface ISerializable {
        saveTo(item: SP.ListItem): void;

        loadFrom(item: SP.ListItem): void;
    }

    export interface IFactory<TModelType extends ISerializable> {
        new (item: SP.ListItem): TModelType;
    }

    export interface IExecutionContext {
        user(): IExecutionResult<SP.User>;

        lists(): IExecutionResult<SP.ListCollection>;

        list(listName: string): IExecutionResult<SP.List>;

        items<TModelType extends ISerializable>(factory: IFactory<TModelType>, query?: Query): IResult<TModelType[]>;

        createItem<TModelType extends ISerializable>(data: TModelType): IResult<TModelType>;

        startAsync(): void;
    }
}