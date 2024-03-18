import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketUpdatedEvent} from "@santickets/common";
import mongoose from "mongoose";
import {Message} from 'node-nats-streaming';
import {Ticket} from "../../../models/ticket";

const setup = async () =>{
    //create a listener
    const listener = new  TicketUpdatedListener(natsWrapper.client)

    //create and save a ticket
    const ticket = Ticket.build({
            id: mongoose.Types.ObjectId().toHexString(),
            title: 'concert',
            price: 24
        })
    await ticket.save();

    //create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version +1,
        title: 'new concert',
        price: 333,
        userId: 'myuserid'
    }
    

    //create a fake msg object
    //@ts-ignore
    const msg:Message={
        ack: jest.fn()
    }

    //returns all the stuff
    return {msg, data, ticket, listener}
}


it('finds, updates, and saves a ticket', async ()=>{
    const {msg, data, ticket, listener} = await setup();

    await listener.onMessage(data,msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async ()=>{
    const {listener, data, msg, ticket} = await setup();

    //call the onMessage function with the data object + message object
    await listener.onMessage(data,msg);

    //assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
})

it('does not cal ack if the event is in the future', async ()=>{
    const {msg, data, listener, ticket} = await setup();
    data.version =10;

    try{
        await listener.onMessage(data,msg)
    }catch (e) {

    }
    expect(msg.ack).not.toHaveBeenCalled();
})