import express,{Response,Request} from "express";
import {NotAuthorizedError, NotFoundError, requireAuth} from "@santickets/common";
import {Order} from "../models/order";

const router = express.Router();

router.get('/api/orders/:orderId',async (req:Request,res:Response)=>{
    const order = await Order.findById(req.params.orderId)
        .populate('ticket') //pull order and populate ticket dat

    if(!order){
        throw new NotFoundError();
    }

    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }

    res.send(order)
});

export { router as showOrderRouter };