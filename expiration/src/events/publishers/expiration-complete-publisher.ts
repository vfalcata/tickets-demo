import {ExpirationCompleteEvent, Publisher, Subjects} from "@santickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject:Subjects.ExpirationComplete=Subjects.ExpirationComplete;

}