import request from 'supertest';
import {app} from "../../app";
import {Order, OrderStatus} from "../../models/order";
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper"; //uses the mock
import mongoose from 'mongoose';

it('marks an order as cancelled',async ()=>{
    //create a ticket with Ticket Model
    const ticket = Ticket.build({
        title: 'concert',
        price: 31,
        id:mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    //make a request to create an order
    const user = global.signin();
    const {body:order}=await request(app)
        .post('/api/orders')
        .set('Cookie',user)
        .send({ticketId: ticket.id})
        .expect(201)

    //make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie',user)
        .send()
        .expect(204);

    //Expectation to make sure the thing is called
    const  updatedOrder = await Order.findById(order.id)

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order cancelled event',async ()=>{
    //create a ticket with Ticket Model
    const ticket = Ticket.build({
        title: 'concert',
        price: 31,
        id:mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    //make a request to create an order
    const user = global.signin();
    const {body:order}=await request(app)
        .post('/api/orders')
        .set('Cookie',user)
        .send({ticketId: ticket.id})
        .expect(201)

    //make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie',user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});