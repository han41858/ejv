import { DataType, ErrorType, NumberFormat, StringFormat } from './constants';
export interface Scheme {
    key?: string;
    type: DataType | DataType[];
    optional?: boolean;
    nullable?: boolean;
    min?: number | string | Date;
    exclusiveMin?: boolean;
    max?: number | string | Date;
    exclusiveMax?: boolean;
    enum?: number[] | string[];
    format?: NumberFormat | NumberFormat[] | StringFormat | StringFormat[];
    minLength?: number;
    maxLength?: number;
    pattern?: string | string[] | RegExp | RegExp[];
    properties?: Scheme[];
    unique?: boolean;
    items?: DataType | DataType[] | Scheme | Scheme[];
}
export interface Options {
    customErrorMsg?: {
        [key in ErrorType]: any;
    };
}
export interface InternalOptions extends Options {
    path: string[];
}
export declare class EjvError {
    type: ErrorType;
    message: string;
    data: any;
    path: string;
    constructor(type: ErrorType, message: string, path: string[], data: any);
}
