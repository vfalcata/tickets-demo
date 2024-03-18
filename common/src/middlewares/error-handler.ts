import {Request, Response, NextFunction} from "express";
import {CustomError} from "../errors/custom-errors";
//4 arguments to errorhandler since if this is passed to a route as the last arg express assumes it is our error handler
//if we import this to app.use() it will be the default errorHandler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    //CustomError should be an abstract method

    if (err instanceof CustomError) {
        return res.status(err.statusCode).send({errors: err.serializeErrors()});
    }
    console.error(err);//log out the error if it is not one that this error handler recognizes
    res.status(400).send({
        errors: [{message: 'Something went wrong'}]
    });

}