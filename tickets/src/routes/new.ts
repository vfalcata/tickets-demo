import express, {raw, Request, Response} from "express";
import {requireAuth,validateRequest} from "@santickets/common";
import {body} from "express-validator";
import {Ticket} from "../models/ticket";
import {TicketCreatedPublisher} from "../events/publishers/ticket-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.post('/api/tickets',requireAuth,[
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({gt: 0})
        .withMessage('Price must be greater than 0')
],
    validateRequest,
    async (req:Request, res:Response)=>{
    const {title, price} = req.body;
    const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
        //require auth already ensures current user by the time it gets here
        //the exclaimation tells TS its ok
    });

    await ticket.save();
    //after saving the ticket we must publish the event
    await new TicketCreatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    })
    //always pull the values from the 'ticket' variable since mongoose may have sanitize or alter input before saving

    res.status(201).send(ticket);
})

export {router as createTicketRouter};