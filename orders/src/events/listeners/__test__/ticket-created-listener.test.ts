import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedEvent} from "@santickets/common";
import mongoose from "mongoose";
import {Message} from 'node-nats-streaming';
import {Ticket} from "../../../models/ticket";

const setup = async ()=>{
    //Create the listener instance
    const listener = new TicketCreatedListener(natsWrapper.client);

    //create a fake data event
    const data: TicketCreatedEvent['data'] = {
        version:0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
        userId:new mongoose.Types.ObjectId().toHexString()
    };

    //create a fake message object
    //@ts-ignore //we do not want to implement all properties, when only care about the ack function so we will mock it
    const msg:Message = {
        ack: jest.fn()
    }

    return {listener, data, msg}

}

it('creates and saves a ticket', async ()=>{
    const {listener, data, msg} = await setup();

    //call the onMessage function with the data object + message object
    await listener.onMessage(data,msg);

    //assertions to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acks the message',async  ()=>{
    const {listener, data, msg} = await setup();

    //call the onMessage function with the data object + message object
    await listener.onMessage(data,msg);

    //assertions to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);

    //assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

