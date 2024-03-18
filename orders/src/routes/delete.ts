import express,{Response,Request} from "express";
import {NotAuthorizedError, NotFoundError, requireAuth} from "@santickets/common";
import {Order,OrderStatus} from "../models/order";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

//we will stick with the delete route, even though its not the most accurate description
//PATCH would be more ideal, because we dont really delete from the db.
router.delete('/api/orders/:orderId',async (req:Request,res:Response)=>{
    const {orderId} = req.params;

    const order = await Order.findById(orderId)
        .populate('ticket'); //we need full ticket data

    if(!order){
        throw new NotFoundError();
    }

    if(order.userId !==req.currentUser!.id){
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save()

    //publish an event saying that order was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id:order.id,
        version: order.version,
        ticket:{
            id:order.ticket.id,

        }
    })

    res.status(204).send({});
});

export { router as deleteOrderRouter };