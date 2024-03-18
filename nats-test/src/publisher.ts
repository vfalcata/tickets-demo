import nats from 'node-nats-streaming';
import {TicketCreatedPublisher} from "./events/ticket-created-publisher";

//Testing Publishers are similar in nature to making a network requests, so not a lot to test

//The documentation refers to client as 'stan', it is just what they like to call a client, stan is just nats backwards
const client = nats.connect('ticketing','abc', {
    url: 'http://localhost:4222'
});
//after the client connects successfully it will emit a 'connect event' which we will listen to


//we do not have access to await async syntax, so we have to take a more event driven approach
client.on('connect',()=>{
    console.log('Publisher connected to NATS');
    const publisher = new TicketCreatedPublisher(client);
    //many times we will want to await for this to be published before we do other things
    try {
        publisher.publish({
            id:'123',
            title: 'concert',
            price: 23
        })
    }catch (e) {

    }

})

//This program exists outside the cluster. It must have a way to communicate with the NATS pod, we can use Ingress-Nginx
//as before, or we can expose a NodePort, to it.

//We can run a command in the terminal to tell kubernetes to port forward a port off a very specific pod inside our cluster.
//It works like a NodePort
//command
//kubectl port-forward {POD_NAME} {SOURCE_PORT_ACCESSED_BY_LOCAL_MACHINE_TO_GET_TO_POD}:{FORWARDED_PORT_ON_THE_POD_TO_BE_ACCESSED}
//this can be used for anything where we need a temporary direct connection to a pod
//kubectl port-forward nats-depl-667c6946bf-t2fw9 4222:4222




/* OLD VERSION
//we do not have access to await async syntax, so we have to take a more event driven approach
client.on('connect',()=>{
    console.log('Publisher connected to NATS');
    const data=JSON.stringify({
        id:'123',
        title: 'concert',
        price: 23
    });

    client.publish('ticket:created', data, ()=>{
        //callback function invoked after we publish data
        console.log('event published')
    })
})

//This program exists outside the cluster. It must have a way to communicate with the NATS pod, we can use Ingress-Nginx
//as before, or we can expose a NodePort, to it.

//We can run a command in the terminal to tell kubernetes to port forward a port off a very specific pod inside our cluster.
//It works like a NodePort
//command
//kubectl port-forward {POD_NAME} {SOURCE_PORT_ACCESSED_BY_LOCAL_MACHINE_TO_GET_TO_POD}:{FORWARDED_PORT_ON_THE_POD_TO_BE_ACCESSED}
//this can be used for anything where we need a temporary direct connection to a pod
//kubectl port-forward nats-depl-667c6946bf-t2fw9 4222:4222

 */