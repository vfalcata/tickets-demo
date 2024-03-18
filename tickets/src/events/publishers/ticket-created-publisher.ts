import {Publisher, Subjects, TicketCreatedEvent} from "@santickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject:Subjects.TicketCreated = Subjects.TicketCreated;
}