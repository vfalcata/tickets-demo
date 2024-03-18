import request from 'supertest';
import {app} from '../../app';
import {response} from "express";

it('responds with details about the current user',async ()=>{

    //global.signin() can be used as well
    const cookie = await global.signin();

    //postman and the browser both manage cookies for us so followup calls work the way they should
    //supertest does not manage cookies, so it will not be able to see any cookie that was ever stored from
    //a previous request. cookies are not included with follow up requests. so we must manage the cookies ourselves
    // we can simply store the cookie that comes from a response and just set it for future auth required requests
    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie',cookie)
        .send()
        .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com')
})

it('responds with null if not authenticated', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send()
        .expect(200)

    expect(response.body.currentUser).toBeNull()
})