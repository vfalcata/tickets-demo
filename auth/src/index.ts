import mongoose from 'mongoose';
import {app} from "./app";

const start =async ()=>{
    //we want to check right away of our requried env variables are not defined instead of waiting for some request to throw an error
    //somehere during the runtime.
    console.log("starting up.....")
    if(!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be defined')
    }
    try{
        //This hard coded version is left here as an example
        //other services that requrie auth mongo connection will have it encoded in the env var which is the better method
        //this is left here for example purposes
        await mongoose.connect('mongodb://auth-mongo-srv:27017/auth',{        //the parameter after the port is the name of the database. if it doesnt exist, mongoose will create it
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