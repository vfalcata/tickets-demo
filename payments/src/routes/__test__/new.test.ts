import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Order} from "../../models/order";
import {OrderStatus} from "@santickets/common";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";

// this mock was used to test the route implementations directly, If we want to see how our app interacts
// directly with the real stripe API, we would NOT use a mock.
//personally implemented a dev.env to pull the api key. This is needed because the env vars we implemented
//only are accessible within the kubernetes cluster. The test suites exist outside the cluster so have no access
// to env vars, so env-cmd was used in conjuction with test script to load the keys, and also a .gitignore was
//added in order to ignore the configs
// jest.mock('../../stripe')
/*
When a manual mock exists for a given module, Jest's module system will use that module when explicitly calling
 jest.mock('moduleName'). However, when automock is set to true, the manual mock implementation will be used instead
 of the automatically created mock, even if jest.mock('moduleName') is not called. To opt out of this behavior you will
  need to explicitly call jest.unmock('moduleName') in tests that should use the actual module implementation.
 */
jest.unmock('stripe')

it('returns a 404 when purchasing an order that does not exist', async ()=>{
    await request(app)
        .post('/api/payments')
        .set('Cookie',global.signin())
        .send({
            token: 'mytoken',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
})

it('returns a 401 when purchasing an order that doesnt belong to the user', async ()=>{
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 32,
        status: OrderStatus.Created
    })

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie',global.signin())
        .send({
            token: 'mytoken',
            orderId: order.id
        })
        .expect(401);
})

it('returns a 400 when purchasing a cancelled order', async ()=>{
    const userId = mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 32,
        status: OrderStatus.Cancelled
    })

    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie',global.signin(userId)) //pass userId here
        .send({
            token: 'mytoken',
            orderId: order.id
        })
        .expect(400);
})

jest.setTimeout(60000)
it('returns a 201 with valid inputs',async ()=>{
    const userId = mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random()*100000)
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: price,
        status: OrderStatus.Created
    })

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie',global.signin(userId)) //pass userId here
        .send({
            token: 'tok_visa', //this token will always work for stripe api testing
            orderId: order.id
        })
        .expect(201);

    const stripeCharges = await  stripe.charges.list({limit:100});
    const stripeCharge = stripeCharges.data.find((charge) => {
        return charge.amount === price * 100;
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');


    /* THESE TEST ARE FOR THE MOCK VERSION
        const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
        expect(chargeOptions.source).toEqual('tok_visa');
        expect(chargeOptions.amount).toEqual(32*100);
        expect(chargeOptions.currency).toEqual('usd');
     */

    const payment = await Payment.find({
        orderId: order.id,
        stripeId: stripeCharge!.id,
    });

    expect(payment).not.toBeNull();
})

