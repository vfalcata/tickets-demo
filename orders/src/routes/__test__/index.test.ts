import request from 'supertest';
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import mongoose from "mongoose";


const buildTicket=async (number:number)=>{
    const ticket = Ticket.build({
        title: `concert ${number}`,
        price: 67,
        id:mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();
    return ticket;
}

it('fetches orders for a particular user', async ()=>{
    //create 3 tickets
    const ticketOne = await buildTicket(1);
    const ticketTwo = await buildTicket(2);
    const ticketThree = await buildTicket(3);

    //create on order as user #1
    const userOne = global.signin();
    const userTwo = global.signin();

    //create 2 orders as user #2
    await request(app)
        .post('/api/orders')
        .set('Cookie',userOne)
        .send({ ticketId: ticketOne.id})
        .expect(201);

    //Make request to get orders for User #2
    const {body: orderOne} = await request(app)
        //destructure and renaming
        .post('/api/orders')
        .set('Cookie',userTwo)
        .send({ ticketId: ticketTwo.id})
        .expect(201);

    const {body: orderTwo} = await request(app)
        .post('/api/orders')
        .set('Cookie',userTwo)
        .send({ ticketId: ticketThree.id})
        .expect(201);


    //Make sure we only go the orders associated with the User
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie',userTwo)
        .expect(200);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);

})