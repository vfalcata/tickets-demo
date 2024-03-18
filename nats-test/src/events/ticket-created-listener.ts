import {Message} from "node-nats-streaming";
import { Listener} from "./base-listener";
import {TicketCreatedEvent} from "./ticket-created-event";
import { Subjects } from "./subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    readonly queueGroupName='payments-service';
    readonly subject:Subjects.TicketCreated=Subjects.TicketCreated;
    //type annotation needed to specify it is an element of an enumeration

    onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
        console.log(`Event data! `,data)
        console.log(data.id)
        console.log(data.title)
        console.log(data.price)
        msg.ack();
    }

}
