import {Publisher, OrderCreatedEvent,Subjects} from "@santickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject:Subjects.OrderCreated = Subjects.OrderCreated;
}

