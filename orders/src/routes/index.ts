import express,{Response,Request} from "express";
import {requireAuth} from "@santickets/common";
import {Order} from "../models/order";

const router = express.Router();

router.get('/api/orders',requireAuth,async (req:Request,res:Response)=>{
    const orders = await Order.find({
        userId: req.currentUser!.id
    })
        .populate('ticket');
    //similar to a FK, refers to Tickets collection to fill out the ticket info
    // recall that in our order model we stored ticket id's, calling populate will
    // call the collection that was 'ref' in the model and fill out all the fields

    res.send(orders);
})

export { router as indexOrderRouter };

