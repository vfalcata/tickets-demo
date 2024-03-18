import buildClient from "../api/build-client";
import Link from 'next/link';
//Data loading CANNOT occur in components themselves, when this is render,
// we do not get any opportunity to make a request. All of our components are rendered 1 single time
//So we cannot attempt to make a request wait for the response and possibly try to update some state after
//instead each component DURING server side rendering, can make request, and then rendered together once and we take that result
const LandingPage= ({currentUser,tickets}) => {
    //routing via href with a Link for a wildcard query (in this case id) can be difficult
    //so thats why we require some generic route without any kind of customized ids with:
    //href="/tickets/[ticketId]"
    //then we specify the real url we are trying to navigate to
    // as={`/tickets/${ticket.id}`
    //additionally we want a url that is easy to remeber, so simply just redirction to a url
    //with some complex id is not a great idea. So the generic
    //we also need a similar template when we use Router.push('') as well
    const ticketList = tickets.map(ticket=>{
        return(
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                        <a className="">View</a>
                    </Link>
                </td>
            </tr>
        )
    })

    return(<div>
        <h1>Tickets</h1>
        <table className="table">
            <thead>
            <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Link</th>
            </tr>
            </thead>
            <tbody>
            {ticketList}
            </tbody>
        </table>
    </div>)

    // console.log('WORKED!',currentUser)
    // return currentUser? (<h1>You are signed in</h1>):(<h1>You are NOT signed in</h1>);
}
//COMPONENT CALLS ARE ALWAYS EXECUTED FROM THE BROWSER SIDE

//FETCH DATA WHILE RENDERING ON THE SERVER SIDE
//this property is specific to Nextjs it is usefult for fetching initial data for rendering our app
//NextJS will call this function WHILE it is attempting to render our application on the server
//this is our opportunity to attempt to fetch some data that this component (LandingPage) needs
//**during** the server side rendering process. Rendering happens at the same time fetching does

// LandingPage.getInitialProps = async ({req})=>{
    //Whenever this function gets called on a server, the first argument to the function
    //will be an object that has a property 'req' which is the request object, just like an express app

//REFACTOR SIGNATURE CHANGE:
LandingPage.getInitialProps = async (context,client,currentUser)=>{
    //we will just use the context object entirely and pass in to our function instead of destructuring

    //IMPORTANT: 3 circumstances for how NextJS makes server or client calls with this funciton
        //1:
//Once invoked any data from it usually in the form of an object is going to be provided to our component as a Prop
//Html will be assembled form all components and sent back as a response
    //any data returned from this function will show up on our component and we will be allowed to access it

    //Normally this is good and would work but because of kubernetes and our microservice environment
    // it may not work as expected. It will throw an error because this request is going to be made in the
    //context of this pod/container,  When this funciton is called WHILE inside the server it will try to use localhost
    // inside its virtual system to resolve the request
    //The path to the auth service does not exist inside the client container, it is in a separate
    //container inside the same cluster. We need to make it so that it will use the host and port using our browser url.
    //that way the request will be sent to the correct container to process. This is also why when we make the same request
    //on the function LandingPage, it worked because it was sent from the browser which sent the correct url
    //
    //Solutions:
        //1) we tell something inside NextJS, to use the address of the service (in this case auth-srv) and mak the request directly to it.
        //     This is not a good solution because then our react client code will need to know the name for every service, which we will have to encode.
        //      Additionally we would also need to know which service correspond to which route.
        //2 what we will use) Have NextJS reach out to Ingress Nginx which is already running inside the cluster, and it can figure out where to send
        //  the request off based upon just the path by itself. The challenge, is that we do not know what domain Ingress Nginx is.
        //  How do we make a request to Nginx WHILE we are inside the client pod? On the host machine its easy since we set up the /etc/hosts
        //  Essentially we need to make a request to Ingress Nginx while inside some pod. Also another issue is that our entire,
        //  Authentication mechanism relies on the cookie saved on the browser. So we have to keep in mind that there will be a request
        //  from the browser that includes this cookie, so any follow up request will probably need to have  the cookie info.
        //  Right now if this axios request gets submitted on the server, we will NOT have access to the browser and thus the cookie.
        //  we need a way to tell the container the domain to request from
        //  Normally when we try to access services like auth-srv we are able to because they are in the same 'namespace'
        //  Name spaces are used to organize different objects in the cluster, all our objects are created in the default namespace
        //  running kubectl get namespace, will show us that Ingress Nginx has its own separate namespace, this means we cant use
        //  a name space in default like auth-srv to reach out to a service that exist outside like Ingress Nginx.
        //  We need a more complicated domain=  http://{NAME_OF_SERVICE}.{NAMESPACE}.svc.cluster.local
        //  External Name Service remaps domain of a request inside a namespace, to something else so we can reach out to other namespaces

    //window ONLY exists inside the browser, so with this we can determine if we are in the browser or server before requesting


    const {data} = await client.get('/api/tickets');


    return {tickets:data};
    //This object will be merged to the props passed to the landing page, so now we should have
    //access to both the currentUser and tickets

/*  REPLACED WITH CODE ABOVE AFTER REFACTORING
    if (typeof window === 'undefined'){
        //we are inside the server, we need base domain to ingress-nginx
        //we can use External Name service to remap the domain, here we just type the whole thing for simplicity
        const {data} = await axios.get(
            'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',{
            //options
            headers:req.headers //now we can use the request object instead of hard coding a host value which was previously done (seen below)
                // {
                //Host: 'ticketing.local' //Ingress-Nginx will look at this header, and understand what domain we want
                //}
        }).catch((err) => {
            console.log(err.message);
        });
        return data;
    }else{
        //we are on the browser, so we do not need a base domain, and cookie is included since it is from the browser
        const {data} = await axios.get('/api/users/currentuser').catch((err) => {
            console.log(err.message);
        });
        return data;
    }

 */

}

export default LandingPage;