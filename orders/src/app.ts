import express from 'express';
import 'express-async-errors';
import { newOrderRouter } from "./routes/new";
import { NotFoundError,errorHandler, currentUser } from '@santickets/common';
import { showOrderRouter } from "./routes/show";
import { indexOrderRouter } from "./routes/index";
import { deleteOrderRouter } from "./routes/delete";

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

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);

app.all('*',async (req,res)=>{
    throw new NotFoundError()
})
app.use(errorHandler);

export { app };