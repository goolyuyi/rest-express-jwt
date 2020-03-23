const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
chai.use(chaiHttp);

const testServer = require('./test-server');

//TODO: not working
describe('use test server', function () {
    describe('jwt-in-cooke Schema', function () {
        let agent;
        before(function () {
            agent = chai.request.agent(testServer);
        });

        it('login', async function () {
            let res = await agent.get('/login');

            expect(res).to.have.status(200);
            expect(res).to.have.cookie('jwt');
            expect(res).to.have.json;
            expect(res.body.jwtid_digest).has.lengthOf(40);

            let res2 = await agent.get('/user-info').set('jwtid_digest', res.body.jwtid_digest);
            expect(res2).to.have.status(200);

            let res3 = await agent.get('/user-info').set('jwtid_digest', res.body.jwtid_digest);
            expect(res3).to.have.status(200);

        });
        after(function () {
            agent.close();
        })

    });
});
