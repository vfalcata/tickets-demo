import express from 'express';
import 'express-async-errors';
import { NotFoundError,errorHandler, currentUser } from "@santickets/common";
import {createChargeRouter} from "./routes/new";
//to handle cookie making
import cookieSession from 'cookie-session'


const app = express();
app.set('trust proxy', true)

app.use(express.json());

//cookie session must run fist to check for current user
app.use(cookieSession({
    //configuration options
    signed:false, //store cookie unencrypted
    secure: process.env.NODE_ENV !=='test',

}));

app.use(currentUser);
app.use(createChargeRouter)


app.all('*',async (req,res)=>{
    throw new NotFoundError()
})
app.use(errorHandler);

export { app };