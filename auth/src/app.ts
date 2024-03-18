import express from 'express';
import 'express-async-errors'; //must come after express, and augments its functionality
//we use this module so that we do not have to rely on hard coding next() in to our functions



//to handle cookie making
import cookieSession from 'cookie-session'
const app = express();
app.set('trust proxy', true)
//traffic is being proxied to our application through ingress nginx
//express is going to see the fact that stuff is being proxied and by default express is going to say
//'hey wait, theres a proxy here. I dont really trust this connection.' so with this setting, express
//is aware that its behind a broxy of ingress and nginx and to make sure that it should still trust traffic
//as being secure even though its coming from that proxy

app.use(express.json());
app.use(cookieSession({
    //configuration options
    signed:false, //store cookie unencrypted
    secure: process.env.NODE_ENV !=='test',
    //require HTTPS connection, and since we are behind a proxy we must additional set above:
    //app.set('trust proxy', true) .. in order to generate a cookie for the session
    //now when we test, the test will also expect https request, but the common testing frameworks
    //do not use https, so instead we want to set this to false conditionally when we are running tests
}));
import { currentUserRouter } from "./routes/current-user";
import { signinRouter} from "./routes/signin";
import {signoutRouter} from "./routes/signout";
import {signupRouter} from "./routes/signup";
import { NotFoundError,errorHandler } from "@santickets/common";

//Remember ORDER MATTERS FOR ROUTES, it is first come first served
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

//when a function is marked async it no longer returns an immediate value
//instead it will return a promise for something that will be fufilled in the future
// we need express to receive the error somehow, and to do this we must pass the error in to
// the built in next({ERROR}) function (we dont need to throw it). Express regards then regards the current request as being
// an error and will skip any remaining non-error handling routing and middleware functions
// but this method will make us rely on next() function build in to express so we want to remove that dependence
// Using the express-async-errors module, will handle this for us and properly send the error wheter it is async or not

//This is a custom error if path is not found, and should always be last
app.all('*',async (req,res)=>{
    throw new NotFoundError()
})
//if error is thrown it will automatically throw and Express will catch this on its own

//app will throw error before this will then be passed to the errorHandler
app.use(errorHandler);

export { app };