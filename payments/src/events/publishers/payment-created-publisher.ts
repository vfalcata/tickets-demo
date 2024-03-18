import {Publisher, PaymentCreatedEvent,Subjects} from "@santickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject:Subjects.PaymentCreated = Subjects.PaymentCreated;
}

