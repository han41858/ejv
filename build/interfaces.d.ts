import { DataType, ErrorKey, NumberFormat, StringFormat } from './constants';
export interface Scheme {
    key?: string;
    type: DataType | DataType[];
    optional?: boolean;
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
    errorMsg?: {
        [key in ErrorKey]: any;
    };
}
export interface InternalOptions extends Options {
    path: string[];
}
export declare class EjvError {
    errorKey: ErrorKey;
    message: string;
    data: any;
    path: string;
    constructor(errorKey: ErrorKey, message: string, path: string[], data: any);
}
