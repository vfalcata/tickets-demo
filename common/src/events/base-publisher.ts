import {Stan} from "node-nats-streaming";
import {Subjects} from "./subjects";

interface Event{
    subject:Subjects;
    data:any;
}

export abstract class Publisher<T extends Event>{
    abstract subject: T['subject'];
    protected client: Stan;

    constructor(client:Stan) {
        this.client=client;
    }

    publish(data:T['data']):Promise<void>{
        //return type is Promise<void>, since we dont really resolve with any data
        return new Promise((resolve,reject)=>{
            this.client.publish(this.subject, JSON.stringify(data),
                //callback is invoked after NATS streaming library after event is published successfully
                (err)=>{
                //error will be present if something went wrong or it will be undefined
                    if(err){
                        return reject(err);
                    }
                    console.log('Event published to the subject', this.subject)
                    resolve();
            })
        });

    }
}