import request from 'supertest';
import {app} from '../../app';
import {response} from "express";

it('clears the cookie after signing out',async ()=>{
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signout')
        .send({})
        .expect(200);

    //checking that the cookie is undefined is valid as well
    // this string output of response likely will never change so this is fine
    expect(response.get('Set-Cookie')[0]).toEqual('express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly')
})