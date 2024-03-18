import { ValidationError } from "express-validator";
import {CustomError} from "./custom-errors";

export class RequestValidationError extends CustomError{
    statusCode = 400;
    constructor(public errors: ValidationError[]) {
        super('Invalid request parameters');
        //Required since we are extending a built in class
        Object.setPrototypeOf(this, RequestValidationError.prototype)
    }
//conform the error to match our schema
    serializeErrors(){
        return this.errors.map(error=>{
            //error.msg and error.param from ValidationError from express.validator library
            return{message:error.msg, field: error.param}
        })
    }
}