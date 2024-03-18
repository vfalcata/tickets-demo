import express from 'express';
import 'express-async-errors';
import {createTicketRouter} from "./routes/new";
import { NotFoundError,errorHandler, currentUser } from "@santickets/common";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes/index";
import { updateTicketRouter } from "./routes/update";

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

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*',async (req,res)=>{
    throw new NotFoundError()
})
app.use(errorHandler);

export { app };