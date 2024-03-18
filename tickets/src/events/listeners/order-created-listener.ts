import {Listener, OrderCreatedEvent, Subjects} from "@santickets/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from 'node-nats-streaming'
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    queueGroupName=queueGroupName;
    subject:Subjects.OrderCreated=Subjects.OrderCreated;
    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        // find the ticket that tihe order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // if no ticket throw error
        if(!ticket){
            throw new Error('Ticket not found')
        }

        // mark the ticket as being reserved byu setting its orderId property
        ticket.set({orderId: data.id})

        // save the ticket
        await ticket.save();

        //use await here so if there is an error it will be thrown and we will not reach msg.ack()
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        });

        // ack the message
        msg.ack();
    }
}

/*
A key concurrency issues to consider here is if the ticket is updated via some order event, the version
number will then increase. When the ticket service then publishes a new event, such as an update, then
other services that read these events from the ticket service, will check the version number, only to see
that it is missing any version change which the ticket service did not emit. This implies that for ANY
action that would cause a change in version for a ticket, there should be an event to emit the version and update
 */