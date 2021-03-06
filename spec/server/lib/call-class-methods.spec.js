import { expect } from 'chai';
import httpMocks from 'node-mocks-http';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

import Character from '../../../server/models/character';

const err = new Error('errorText');
const notFoundErr = new Error('Not Found');

let stubs;
let method;
let character;

beforeEach(() => {

	stubs = {
		renderJson: sinon.stub().returns('renderJson response'),
		res: httpMocks.createResponse(),
		next: sinon.stub()
	};

});

const createSubject = () =>
	proxyquire('../../../server/lib/call-class-methods', {
		'./render-json': stubs.renderJson
	});

describe('Call Class Methods module', () => {

	describe('callInstanceMethod function', () => {

		beforeEach(() => {

			method = 'edit';
			character = new Character;

		});

		context('resolves with data', () => {

			it('will call renderPage module', done => {

				const subject = createSubject();
				const instanceMethodResponse = { property: 'value' };
				sinon.stub(character, method).callsFake(() => { return Promise.resolve(instanceMethodResponse) });
				subject.callInstanceMethod(stubs.res, stubs.next, character, method).then(result => {
					expect(stubs.renderJson.calledOnce).to.be.true;
					expect(stubs.renderJson.calledWithExactly(stubs.res, instanceMethodResponse)).to.be.true;
					expect(stubs.next.notCalled).to.be.true;
					expect(result).to.eq('renderJson response');
					done();
				});

			});

		});

		context('resolves with error', () => {

			it('will call next() with error', done => {

				const subject = createSubject();
				sinon.stub(character, method).callsFake(() => { return Promise.reject(err) });
				subject.callInstanceMethod(stubs.res, stubs.next, character, method).then(() => {
					expect(stubs.next.calledOnce).to.be.true;
					expect(stubs.next.calledWithExactly(err)).to.be.true;
					expect(stubs.renderJson.notCalled).to.be.true;
					done();
				});

			});

		});

		context('resolves with \'Not Found\' error', () => {

			it('will respond with 404 status and send error message', done => {

				const subject = createSubject();
				sinon.stub(character, method).callsFake(() => { return Promise.reject(notFoundErr) });
				subject.callInstanceMethod(stubs.res, stubs.next, character, method).then(() => {
					expect(stubs.res.statusCode).to.eq(404);
					expect(stubs.res._getData()).to.eq('Not Found');
					expect(stubs.renderJson.notCalled).to.be.true;
					expect(stubs.next.called).to.be.false;
					done();
				});

			});

		});

	});

	describe('callStaticListMethod function', () => {

		beforeEach(() => {

			method = 'list';

		});

		afterEach(() => {

			Character[method].restore();

		});

		context('resolves with data', () => {

			it('will call renderPage module', done => {

				const subject = createSubject();
				const staticListMethodResponse = [{ property: 'value' }];
				sinon.stub(Character, method).callsFake(() => { return Promise.resolve(staticListMethodResponse) });
				subject.callStaticListMethod(stubs.res, stubs.next, Character, 'character').then(result => {
					expect(stubs.renderJson.calledOnce).to.be.true;
					expect(stubs.renderJson.calledWithExactly(
						stubs.res, staticListMethodResponse
					)).to.be.true;
					expect(stubs.next.notCalled).to.be.true;
					expect(result).to.eq('renderJson response');
					done();
				});

			});

		});

		context('resolves with error', () => {

			it('will call next() with error', done => {

				const subject = createSubject();
				sinon.stub(Character, method).callsFake(() => { return Promise.reject(err) });
				subject.callStaticListMethod(stubs.res, stubs.next, Character, 'character').then(() => {
					expect(stubs.next.calledOnce).to.be.true;
					expect(stubs.next.calledWithExactly(err)).to.be.true;
					expect(stubs.renderJson.notCalled).to.be.true;
					done();
				});

			});

		});

	});

});
