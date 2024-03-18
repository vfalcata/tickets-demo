import express from "express";
import { currentUser } from '@santickets/common';

const router = express.Router();


//cookies should not be accessed by JS in the browser
//at some point in time the react app is going to make requests to figure out who the current user is or
//essentially wheter or not the user is logged in
//If they are logged in there will be a cookie
//If they are not logged in there will not be a cookie
//if cookie is not set or JWT is invalid then return early and send back response like {currentUser:null}
//else if JWT is valid, the payload will be sent back inside the JWT
router.get('/api/users/currentuser',currentUser,(req,res)=>{
    /*currentUser middle ware now handles this
     if(!req.session?.jwt){
         //special TS syntax equivalent to !req.session  || !req.session.jwt
         //the only time req.session.jwt will be undefined is if we do not run our cookie session middleware
         return res.send({currentUser: null})
     }

    //try catch because if the JWT was tampered with than the jwt library will throw an error, so we have to catch it
    //postman sends cookies automatically to any follow up request witht he same domain
    try {
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
        res.send({currentUser: payload})
    }catch (e) {
        res.send({currentUser: null})
    }
     */
    res.send({currentUser: req.currentUser || null }); //currentUser it the actual payload
    //so if the currentUser is not fetched in stead of undefined we pass in null.
});

export{
    router as currentUserRouter
};