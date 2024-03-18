import express,{Request,Response} from "express";
//Request and Response are types we import in for our type annotations
import { body } from 'express-validator'
import jwt from 'jsonwebtoken';
import { User } from '../models/user'
import { validateRequest,BadRequestError } from '@santickets/common';

const router = express.Router();

router.post('/api/users/signup', [//Validation steps middleware
    body('email') //look for the email property and validate with methods
        .isEmail()
        .withMessage('Email must be valid'), //Error message if input is invalid
    body('password')
        .trim()
        .isLength({min:4,max:20})
        .withMessage('Password must be between 4 and 20 characters')
] ,
    validateRequest, //
    async (req:Request,res:Response)=>{ //in TS we need to specify type for req and res

    /* Now done by validateRequest middleware
    const errors = validationResult(req);
    //validationResult will pull out any information and append them to the result, if there were any errors
    if(!errors.isEmpty()){
        //handle if errors exists, we want to send to user
        const error = new Error('Invalid email or password');
        //we want to add an additional property to error to add reasons for error, that is consistent throughout our app
        //with regular JS we can just add a property, but we cannot do this with TS. To achieve this we need a subclass
        throw new RequestValidationError(errors.array());//puts all properties in to array
        //we throw this to our error handler function, we do not want to handle the error ourselves here
        //since we want to maintain consistency
    }
    */
    const {email,password} = req.body
    const existingUser = await User.findOne({email})
    if(existingUser){
        throw new BadRequestError('Email in use')
        return res.send({})
    }

    const user = User.build({email, password}); //builds but does not save
    await user.save(); //must be called to save to db

    //after saving we want to generate a JWT and save it on the session object
    const userJwt = jwt.sign({
        id:user.id,
        email: user.email
    },
        process.env.JWT_KEY!
        //TS will ALWAYS throw an error because TS will never  assume that an environment variable is defined
        //but we already added a check on index.ts so we will tell TS its ok
    );
    //the signed key needs to be shared with ALL the other services but we need to make sure no one else
    //gets their hands on it or else they can manufacturer their own JWT. we need to use and share
    //that signed key throughout our application
    //to do this we wil need a object called a secret

    //req.session will not have properties that we want to store. so we need to add new properties, which TS prevents
    //we usually redefine the object but instead here we'll just create a new object and give it the jwt property
    //TS does NOT want us to assume that there is actually is an object on record in the session
    req.session = {
        jwt: userJwt
        //this will get converted to JSON and then base64 encoded when stored in the browser
        //so to get it back in a usable way we have to do some work
    };

    res.status(201).send(user)
    // notice that their is no cookie in the server response and this is because the cookie session middleware
    // we wired up, we configured it to not try to manage any cookies if the user
    // is connecting over an http. Postman by default uses http, so if we change to https the cookie will be saved
    //MAKE SURE TO DISABLE SSL CERTIFICATES VERIFICATION, this is because we are serving a temporary invalid certificate
    //by ingress nginx
});

export{
    router as signupRouter
};