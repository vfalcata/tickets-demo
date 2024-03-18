import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose';
import {app} from '../app';
import request from 'supertest';


//tells TS that there is some global property
// globalThis has no index signature TS Error
// In the upcoming lecture (and later with the ticketing, orders and payments services) you may end up seeing a TS error like this in your test/setup.ts file:
//     Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.ts(7017)
// This is caused by a recent change in the @types/node library which is a dependency of ts-node-dev.
//     To fix, find the following lines of code in src/test/setup.ts:
// declare global {
//     namespace NodeJS {
//         export interface Global { //adding properties to global interface
//             signin(): Promise<string[]>;
//         }
//     }
// }
//
// change to:
declare global {
    var signin: () => Promise<string[]>;
}

let mongo: any;

//Hook function since it is going to be run before any of our tests start to be executed
beforeAll(async ()=>{
    //specified in package.json
    // mongo = new MongoMemoryServer({
    //     binary:{
    //         version: '4.4.6'
    //     }
    // });
    // await mongo.start()

    process.env.JWT_KEY = 'itisasecret'
    mongo = await MongoMemoryServer.create();

    await mongoose.connect(mongo.getUri(),{
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async ()=>{
    const collections = await mongoose.connection.db.collections();
    for(let collection of collections){
        await collection.deleteMany({});
    };
});

// hook that runs after all tests are completed. it closes down the mongo server
afterAll(async ()=>{

    await mongo.stop();

    // mongo was created in the beforeAll scope so it is not accessible here
    // to allow access we need to declare the variable ahead of time outside the function 'let mongo:any'

    await mongoose.connection.close();
})


//made a global function here for sake of convienience, so we dont have to import, and export other files
//this shouldnt be done in real world, its just done here for this course
global.signin = async () =>{
    const email = 'test@test.com';
    const password = 'password'
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email,password
        })
        .expect(201);

    return response.get('Set-Cookie') //we need to attache this cookie for further requests
}

