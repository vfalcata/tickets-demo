import {useEffect,useState} from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const OrderShow = ({order, currentUser}) =>{
    const [timeLeft, setTimeLeft] = useState(0);
    const {doRequest, errors} = useRequest({
        url: '/api/payments',
        method: 'post',
        body:{
            orderId:order.id
        },
        onSuccess: ()=> Router.push('/orders')
    })

    useEffect(()=>{
        const findTimeLeft = () =>{
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft/1000));
        };

        //we need to manually invoke this so that it is called right away on load or else,
        //we have to wait the 1s interval period before setInterval is called
        findTimeLeft();


        //setInterval will call some function repeatedly at the specified value
        //This will run forever even if we navigate away from this component
        // so we need to specify a termination point when we navigate away or stop showing the component
        //whenever we call setInterval it will actually return a integer based timerId that will
        //identify the interval that was set.
        const timerId = setInterval(findTimeLeft,1000);
        //notice that we only pass a reference to findTimeLeft instead of explicitly calling it


        //whenever we return a function for useEffect, that function will be invoked
        //if we are about to navigate away from the component, or stop showing the component it will be invoked
        // If we have a dependency listed inside the array, it is going to be called when re-rendered.
        return ()=>{
            clearInterval(timerId);
        }
    },[])
    //if a warning is thrown because a dependency is required, we can just input 'order'
    //the warning shows up because we are referencing a dependency in the function,
    //which is in this case order, without referencing it in the array

    if(timeLeft<0){
        return <div>Order expired</div>
    }

    //we can test credit card using testing values that will always work when in test mode
    // 4242 4242 4242 4242
    return <div>
        Time left to pay: {timeLeft} seconds
        <StripeCheckout
            token={({id})=> doRequest({token:id})}
            stripeKey="pk_test_51JMJWxAp9gdlRLVGQk8XOxh0KfAQn4Qy3prJB10ilPFfeJsXoZFOQvF8GoOOf0saNbAGPJ3mWE8JDvoGu1FILLEA00qDom0bvA"
            amount={order.ticket.price * 100}
            email={currentUser.email}
        />
        {errors}
    </div>
}

OrderShow.getInitialProps = async (context,client)=>{
    const {orderId} = context.query;
    const {data} = await client.get(`/api/orders/${orderId}`);
    return {order: data};
}
export default OrderShow;