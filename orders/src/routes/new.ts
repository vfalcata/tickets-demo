import mongoose from 'mongoose';
import express, {Request, Response} from "express";
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from '@santickets/common';
import {body} from "express-validator";
import {Ticket} from "../models/ticket";
import {Order} from "../models/order";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15*60;

//Coupling, how do we ensure ids are the correct structure?
//If we check to ensire that the id is consistent with id's presribed in another service, in this case tickets
//it will mean that it is coupled on something from another service, in this case we are relying on the tickets
//service to use Mongo formula for ID generation and verification
router.post('/api/orders',requireAuth,[
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string)=>  mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided')
], validateRequest,
    async (req:Request,res:Response)=>{

        const {ticketId} = req.body;

        // Find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(ticketId)
        if(!ticket){
            throw new NotFoundError();
        }

        const isReserved = await ticket.isReserved();
        if(isReserved){
            throw new BadRequestError('Ticket is already reserved');
        }


        //Calculate expiration date for user to pay
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);


        //Build the order and save it to the database
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        })
        await order.save();


        // Publish an event saying that an order was created
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            //returns UTC format for the date as a string
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        })

    res.status(201).send(order)

})

export { router as newOrderRouter };