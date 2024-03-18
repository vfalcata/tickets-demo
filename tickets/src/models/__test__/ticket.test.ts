import {Ticket} from "../ticket";
import mongoose from "mongoose";

it('implements optimistic concurrency control', async ()=>{
    //Create an instance of a ticket
    const ticket = Ticket.build({
        title:'concert',
        price: 13,
        userId: '1234'
    })
    //Save the ticket
    await ticket.save();

    //Fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id)
    const secondInstance = await Ticket.findById(ticket.id)

    //make two separate changes to the tickets we fetched
    firstInstance!.set({price:29});
    secondInstance!.set({price:34})

    //save the first fetched ticket, which should work since its version 1
    await firstInstance!.save();
    //save the second fetched ticket, which should throw an error since the first fetch incremented the version
    //jest sometimes does play well with the "toThrow" expectations, so this is a workaround
    try {
        await secondInstance!.save()
        throw new Error('Should not reach this point')
    } catch (err) {
        expect(err).toBeInstanceOf(mongoose.Error.VersionError)
    }
})

it('increments the version number on multiple saves', async ()=>{
    //Create an instance of a ticket
    const ticket = Ticket.build({
        title:'concert',
        price: 13,
        userId: '1234'
    })
    //Save the ticket
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1)
    await ticket.save();
    expect(ticket.version).toEqual(2)
})