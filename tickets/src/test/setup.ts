import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose';
import {app} from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';


declare global {
    var signin: () => string[];
}

//use our mock nats-wrapper
jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async ()=>{
    process.env.JWT_KEY = 'itisasecret'
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(),{
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async ()=>{
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for(let collection of collections){
        await collection.deleteMany({});
    };
});
afterAll(async ()=>{
    await mongo.stop();
    await mongoose.connection.close();
})

global.signin = () =>{
  //we only need to Build a JWT payload {id,email}, no need to test cookie and signup
    const payload = {
        id:new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }
    //we need to Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!) //we already checked in 'beforeAll' so we know this exists

    //Build the session object {jwt: MY_JWT}
    const session = {jwt: token};

    //Turn that session in to JSON
    const sessionJSON = JSON.stringify(session);

    //Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64')

    //return a string thats the cookie with the encoded data
    return [`express:sess=${base64}`];
};

