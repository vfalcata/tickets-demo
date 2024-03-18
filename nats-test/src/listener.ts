import nats, {Message, Stan} from 'node-nats-streaming'
import { randomBytes } from 'crypto';
import {TicketCreatedListener} from "./events/ticket-created-listener";

//Testing Listeners are very similar in nature to request handlers, so there is lots to test

const client = nats.connect('ticketing',randomBytes(4).toString('hex'),{
    url: 'http://localhost:4222'
})

client.on('connect',()=>{
    console.log('listener connected to nats')
    //subscribe first

    //graceful shutdown, that tells NATS to immediatly disconnect a client upon shutdown
    client.on('close',()=>{
        console.log('NATS connection closed!')
        process.exit(); //this ends the process
    })

    new TicketCreatedListener(client).listen();
})


//these will listen for interrupt or termination signals and call close on the client
//this will effectively close the connection first between the client before the process is terminated
process.on('SIGINT', ()=>client.close());
process.on('SIGTERM',()=>client.close());



/* OLD VERSION
client.on('connect',()=>{
    console.log('listener connected to nats')
    //subscribe first

    //graceful shutdown, that tells NATS to immediatly disconnect a client upon shutdown
    client.on('close',()=>{
        console.log('NATS connection closed!')
        process.exit(); //this ends the process
    })

    const options = client
        .subscriptionOptions()
        .setManualAckMode(true)//sets manual acknowledgement mode to true
        .setDeliverAllAvailable() //sends all past events
        .setDurableName('accounting-service')
        //tells NATS to keep track of all events associated with some named service
        //assigns a name to the Subscriber, and tracks all processed events for it
        //on the first start up of the service, it will receive all past events, anything after will start from
        //the lastest recorded processed event attached to the durable name.
        //the issue is if the service goes down NATS will throw away the event records


    const subscription = client.subscribe(
        'ticket:created', //channel we are listening on
        'orders-service-queue-group',
        //will not dump events saved for durable name service, and ensures ALL events are going to a single instance of our service
        //queue group we are apart of. Event if the durable service is gone, it will not dump the entire durable subscriptions
        options
    );
    //then define event/callback
    subscription.on('message',(msg:Message)=>{
        //message are 'events', thats what NATS calls them
        const data =msg.getData();
        console.log('Message recd')
        if(typeof data ==='string'){
            console.log(`Received event #${msg.getSequence()} with data: ${data}`)
        }
        msg.ack(); //acknowledges that message was process to the publisher
    })
})


//these will listen for interrupt or termination signals and call close on the client
//this will effectively close the connection first between the client before the process is terminated
process.on('SIGINT', ()=>client.close());
process.on('SIGTERM',()=>client.close());

 */