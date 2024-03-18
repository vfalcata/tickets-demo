import request from 'supertest';
import {app} from '../../app';

//it , integration test
it('returns a 201 on a successful signup', async ()=>{
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
});

it('returns a 400 with an invalid email', async ()=>{
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test',
            password: 'password'
        })
        .expect(400);
});

it('returns a 400 with an invalid password', async ()=>{
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test',
            password: 'a'
        })
        .expect(400);
});

it('returns a 400 with missing email or password', async ()=>{
    //behind the scenes jest will await and run this test first
    await request(app)
        .post('/api/users/signup')
        .send({
        })
        .expect(400);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
        })
        .expect(400);

    //technically we dont even need to return
    await request(app)
        .post('/api/users/signup')
        .send({
            password: 'password'
        })
        .expect(400);
});

it('disallows duplicate emails', async ()=>{
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(400);
});

it('sets a cookie after successful signup', async ()=>{
    //awaiting a request returns a response
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);

    //recall that in our  app.ts we app.use cookieSession with "secure:true"
    //supertest does not make use of https connection, so when we initially do
    //response.get('Set-Cookie') it will be undefined.
    //we want to flip the value to false "secure:false" when running tests
    expect(response.get('Set-Cookie')).toBeDefined();
});