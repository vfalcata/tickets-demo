import {Message} from 'node-nats-streaming';
import {Listener, Subjects, PaymentCreatedEvent,OrderStatus} from "@santickets/common";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {Order} from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
    subject:Subjects.PaymentCreated=Subjects.PaymentCreated;
    queueGroupName=queueGroupName;
    async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
        const order = await Order.findById(data.orderId);
        if(!order){
            throw  new Error('Order not found');
        }

        order.set({
            status: OrderStatus.Complete
        })

        await order.save();
        msg.ack(); //tells nats that this service has processed the event
    }
}
/*
Normally we would update our order database, and then update version and emit an event. But in the context
of this app, that would not be necessary. This is because nothing would be done with that update.
Once an order is paid for no more changes would be made. No other services rely on this.
This is just to keep the app simple
 */