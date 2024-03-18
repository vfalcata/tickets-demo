import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import {OrderCreatedEvent, OrderStatus} from "@santickets/common";
import mongoose from 'mongoose';
import {Message} from "node-nats-streaming";

const setup = async () =>{
    //create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    //create and save ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: 'asdf'
    });

    await ticket.save();

    //create the fake data event
    const data: OrderCreatedEvent['data']={
        id: mongoose.Types.ObjectId().toHexString(),
        version:0,
        status: OrderStatus.Created,
        userId: 'myuserid',
        expiresAt: 'myexpiry',
        ticket:{
            id:ticket.id,
            price: ticket.price
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, ticket, data, msg}
}

it('sets the userId of the ticket', async ()=>{
    const {listener, ticket, data, msg} = await setup();
    await listener.onMessage(data,msg);
    const updateTicket = await Ticket.findById(ticket.id)
    expect(updateTicket!.orderId).toEqual(data.id);
})

it('acks the message', async ()=>{
    const {listener, ticket, data, msg} = await setup();
    await listener.onMessage(data,msg);
    expect(msg.ack).toHaveBeenCalled();
})

it('publishes a ticket updated event',async ()=>{
    const {listener, ticket, data, msg} = await setup();
    await listener.onMessage(data,msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    //tells TS that this is a mock function so that jest and TS play nicely with each other
    //this will then give us all the properties that a mock function has
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    //data object is supposed to emulate a ticket updated order id event
    expect(data.id).toEqual(ticketUpdatedData.orderId);
})