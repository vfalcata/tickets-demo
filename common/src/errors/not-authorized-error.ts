import { CustomError } from "./custom-errors";

export class NotAuthorizedError extends CustomError {
    statusCode= 401;

    constructor() {
        super('Not authorized');
        Object.setPrototypeOf(this, NotAuthorizedError.prototype)
    }

    serializeErrors(): { message: string; field?: string }[] {
        return [{message: 'Not authorized'}];
    }

}