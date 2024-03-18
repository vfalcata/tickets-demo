import {Publisher, Subjects, TicketUpdatedEvent} from "@santickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject:Subjects.TicketUpdated = Subjects.TicketUpdated;
}