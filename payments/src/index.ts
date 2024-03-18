import mongoose from 'mongoose';
import {app} from "./app";
import {natsWrapper} from './nats-wrapper'; //an instance of the class
import {OrderCancelledListener} from "./events/listeners/order-cancelled-listener";
import {OrderCreatedListener} from "./events/listeners/order-created-listener";

const start =async ()=>{
    //we want to check right away of our requried env variables are not defined instead of waiting for some request to throw an error
    //somehere during the runtime.
    if(!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be defined')
    }
    if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI must be defined')
    }

    if(!process.env.NATS_CLIENT_ID){
        throw new Error('NATS_CLIENT_ID must be defined')
    }
    if(!process.env.NATS_URL){
        throw new Error('NATS_URL must be defined')
    }
    if(!process.env.NATS_CLUSTER_ID){
        throw new Error('NATS_CLUSTER_ID must be defined')
    }

    //we need to also ensure we connect to NATS streaming before we start listening to clients
    //...but this will cause issues, since NATS does NOT have some internal object like mongoose that
    // keeps track of its connection, instead when we call nats.connect it directly returns to us the client
    //and that client is something that we need to figure out how to manually share among all the different files
    //in our project.. But now we will have a circular dependency.
    // TicketCreated Route Handler, requires an instance of NATS client for the instance of Publisher which is imported to app.js then to index.js
    // but the index.ts we want to export NATS client to the TicketCreated Route Handler.
    //We want to initialize the nats client here but we do NOT want to export it.
    //To solve this we will create a nats-client.ts, which is a singleton, internally this is similar to how mongoose works

    try{
        //clusterId defined in nats-depl.yaml
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL)

        //Define graceful shutdown of NATS, this was a design decision because
        //we do not want to have some method that can shutdown NATS hidden away in some dependency
        //We want it at the forefront of the app so we can see and understand. The downside is that
        //it will require code duplication
        natsWrapper.client.on('close',()=>{
            console.log('NATS connection closing!');
            process.exit();
        })
        process.on('SIGINT', ()=>natsWrapper.client.close());
        process.on('SIGTERM',()=>natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI,{        //the parameter after the port is the name of the database. if it doesnt exist, mongoose will create it
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
    }catch (e) {
        console.log(e)
    }


    console.log('connected to Mongodb')
    app.listen(3000,()=>{
        console.log('listening on port 3000...')
    })
}
start(); //we call the function here because we wanted to wrap the async call in a funciton since not all node versions support async calls outside a function