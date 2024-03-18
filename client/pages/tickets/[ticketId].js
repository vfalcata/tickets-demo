//The file name denotes wild card, it will be matched to the route
//so in this case we want: tickets/:id
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const TicketShow = ({ticket})=>{
    const {doRequest, errors} = useRequest({
        url: '/api/orders',
        method: 'post',
        body:{
            ticketId:ticket.id
        },
        onSuccess: (order)=>Router.push('/orders/[orderId]', `/orders/${order.id}`)
    })
    //To push route to wild card we need to specify the url scheme as well as the actual url
    return (
        <div>
            <h1>{ticket.title}</h1>
            <h4>Price: {ticket.price}</h4>
            {errors}
            <button onClick={()=>doRequest()} className="btn btn-primary">Purchase</button>
        </div>
    )

}
//Important note about: '()=>doRequest()'
//we wrap this in an arrow function because our implemention of doRequest takes an object and merges it with the request body
//but since this is an event handler, the event object will be normally passed in to doRequest. so by wrapping
//it in another function, we can control what arguments are passed to it

TicketShow.getInitialProps = async (context,client)=>{
    //the context.query is whatever is stored inside the square brackets, in this case the [ticketId]
    const {ticketId} =context.query;
    const {data} = await client.get(`/api/tickets/${ticketId}`)
    return {ticket:data};
    //this object will be merged to all the props in TicketShow
}

export default TicketShow;