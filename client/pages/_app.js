//this file MUST be named _app.js
import 'bootstrap/dist/css/bootstrap.css'
import buildClient from "../api/build-client";
import Header from "../component/header";

//pass a react component in here

//ROOT COMPONENT
//responsible for rendering each of the different pages over time
const AppComponent =  ({ Component, pageProps, currentUser }) =>{
    //Component: the component we are trying to load from one of the pages. It is the actual page we want to show the user
    //pageProps: the set of components that we intended to pass to the (1st arg) "Component"

    //Also useful for repetive view items like header or footer
    // note that the header my need db info ex. if we are signed it we would only show signout
    // but then this would require the header to know how the current user is, instead
    //of making 2 separate requests, one for the header one for index, we will put that data
    //fetching login int the app component to solve this. This way the App component can fetch the currentUser
    //and hand it down to the header and index.js which would only be one call. But later on we may need
    // to call getInitialProps on index.js, but we cant have both call that function without any extra work
    return (<div>
        <Header  currentUser={currentUser} />
        <div className="container">
            <Component currentUser={currentUser} {...pageProps}/>
        </div>
    </div>);
    //when we try to navigate to a page with nextjs, it will import one of the components from the file in pages
    //nextjs does not just take the component and display it on the screen instead it wraps it up inside its own
    //custom default component this is referred to in next.js as the 'app'
    // by defining our own _app.js we have defined our own custom app component.
    //so if a page is visited nextjs will load the given component (Component) and all the components it loads (pageProps)
    //If we want to load a GLOBAL css file or anything, it MUST be loaded in to this file
}


//we are working on a custom app component that will then wrap up a page
//the arguments for the getInitialProps of an AppComponent are different than a page component
//the req object is nested in some other object. the ctx, is the object that contains the req
AppComponent.getInitialProps = async appContext =>{
 const client = buildClient(appContext.ctx);
 const {data} = await client.get('/api/users/currentuser');
 let pageProps={};
    //loads 'getInitialProps' of (child) page only if it exists
 if(appContext.Component.getInitialProps){
     pageProps = await appContext.Component.getInitialProps(appContext.ctx,client,data.currentUser)
    //multiple arguments, so that we can pull these properties from child pages
     //1 argument gets only the appContext, 2 arguments gets the appContext and client, 3 currentuser, appContext and client
 }
 return {
     pageProps,
     ...data //current user data
 };

}
//when we tie in this function to the App component, the other 'getInitialProps' no longer get called on other pages anymore
//to fix this we will manually invoke a following pages 'getInitialProps'
//so we will get 2 sets of data, one from the AppComponent, and another set from the Page component as props
//we will chop up that object and make sure it gets to the destination page

export default AppComponent;