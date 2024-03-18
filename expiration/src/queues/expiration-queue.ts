import Queue from 'bull';
import {ExpirationCompletePublisher} from "../events/publishers/expiration-complete-publisher";
import {natsWrapper} from "../nats-wrapper";

//this payload is stored as data inside a job
interface Payload{
    orderId: string;
}

//the type here is the type for that data attached to each job
const expirationQueue = new Queue<Payload>('order:expiration',{
    redis:{
        host: process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job)=>{
    //this job object is similar to the Message object in the node-nats-streaming
    //it is an object that wraps up our data and has some information about the job itself as well
    //the data we send along with the job is one of these properties
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
});

export {expirationQueue};