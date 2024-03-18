import {Subjects, Publisher, OrderCancelledEvent } from "@santickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject:Subjects.OrderCancelled = Subjects.OrderCancelled;
}

