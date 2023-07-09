process.env.NODE_ENV = 'test';
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
const bcrypt = require('bcryptjs');
const sinon = require('sinon');
const expect = require('chai').expect;
const server = require('../../src/app');

describe('verifies the signup flow', () => {
    let signUpBody = {
        email: 'efpywi@example.com',
        password: '1234567',
        newsPreferences: {
            countries: ["us"],
            sources: ["Al Jazeera English"],
            languages: ["en"]
          }
    };

    it("1. Successfully signs up a user", (done) => {
        chai.request(server).post('/users/register').send(signUpBody).end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body.message).equal("User registered successfully");
            done();
        });
    })

    it("2. Fails to sign up a user with invalid email", (done) => {
        signUpBody.email = '@@@efpywi@example.com';
        chai.request(server).post('/users/register').send(signUpBody).end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).equal("Please provide a valid email address");
            done();
        });
    })

    it("3. Fails to sign up a user with incomplete fields", (done) => {
        signUpBody.email = '';
        chai.request(server).post('/users/register').send(signUpBody).end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).equal("Please pass valid user details");
            done();
        });
    });

    it("4. Fails to sign up a user already registered", (done) => {
        signUpBody.email = 'efpywi@example.com';
        chai.request(server).post('/users/register').send(signUpBody).end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).equal("This email is already registered");
            done();
        });
    });
})


describe('verifies the signin flow', () => {
    beforeEach((done) => {
        let signUpBody = {
            email: 'test@example.com',
            password: 'test1234567',
            newsPreferences: {
                            countries: ["us"],
                            sources: ["Al Jazeera English"],
                            languages: ["en"]
                          }
        };
        chai.request(server).post('/users/register').send(signUpBody).end((err, res) => {
            done();
        });
    })

    it("1. Successfully signs in a user", (done) => {
        let signInBody = {
            email: 'test@example.com',
            password: 'test1234567'
        }
        chai.request(server).post('/users/login').send(signInBody).end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('user');
            expect(res.body).to.have.property('token');
            expect(res.body.message).equal("User logged in successfully");
            expect(res.body.token).to.not.be.empty;
            expect(res.body.user.email).equal('test@example.com');
            done();
        });
    });

    it("2. Fails to sign in a user with incorrect password", (done) => {
        let signInBody = {
            email: 'test@example.com',
            password: 'test1234567999'
        }
        chai.request(server).post('/users/login').send(signInBody).end((err, res) => {
            expect(res).to.have.status(401);
            expect(res.body.message).equal("Invalid password provided");
            expect(res.body.token).to.be.null;
            done();
        });
    });

    it("3. Fails to sign in a user when the user doesn't exist", (done) => {
        let signInBody = {
            email: 'test12345@example.com',
            password: 'test1234567'
        }
        chai.request(server).post('/users/login').send(signInBody).end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body.message).equal("User not found");
            expect(res.body.token).to.be.null;
            done();
        });
    });
});