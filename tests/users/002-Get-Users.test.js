import test from 'tape'
import request from 'supertest'
import { app, server, initApp } from '../../src/index.js'
import colors from "colors";


test('-------- Endpoint: GET /user'.blue, assert => {
	const expectedCode = 200
	const messageForExpectedCode = `Status code should be ${expectedCode}`.green
	const messageForExpectedResult = 'Response should be an array of users with length longer than 0'.green

	initApp.then(application => {
		request(application.app)
			.get('/users')
			.expect(expectedCode)
			.then(res => {
				assert.pass(messageForExpectedCode)
				const actualResult = res.body._data.users.length > 0
				assert.deepEqual(actualResult, true, messageForExpectedResult)
			})
			.catch(err => {
				assert.fail(err.message.red)
			})
			.finally(() => {
				application.server.close()
				assert.end()
			})
	})
})

test('-------- Endpoint: GET /user/uuid'.blue, assert => {
	const expectedCode = 200
	const messageForExpectedCode = `Status code should be ${expectedCode}`.green
	const newUser = {
		name: "Test User"+Date.now(),
		username: "Test username"+ Date.now(),
		password: "Test password"+ Date.now(),
		email: "Test email"+ Date.now(),
		role : "Test role "+ Date.now(),
		bio: "Test bio"+ Date.now(),
		avatar : "Test avatar "+ Date.now(),
	}

	const expectedResult = newUser.name
	const messageForExpectedResult = `user name should be ${expectedResult}`.green

	initApp.then(application => {

		const req = request(application.app)

		req
			.post('/user')
			.send(newUser)
			.expect(201)
			.then(res => {
				const uuid = res.body._data.users[0].uuid

				return req
					.get(`/users/${uuid}`)
					.expect(200)
					.then(res2 => {
						 assert.pass(messageForExpectedCode)

						const actualResult = res2.body._data.users[0].name

						assert.deepEqual(actualResult, expectedResult, messageForExpectedResult)
					})
			})
			.catch(err => {
				assert.fail(err.message.red)
			})
			.finally(() => {
				application.server.close()
				assert.end()
			})
	})
})

test('-------- Endpoint: GET /user/:uuid (error 404)'.blue, assert => {
	const expectedCode = 404
	const uuidNotFound = 'ThisUuidDoesntExist'
	const messageForExpectedCode = `If uuid doesn\'t exist, status code should be ${expectedCode}`.green

	initApp.then(application => {
		request(application.app)
			.get(`/user/${uuidNotFound}`)
			.expect(expectedCode)
			.then(() => {
				assert.pass(messageForExpectedCode)
			})
			.catch(err => {
				assert.fail(err.message.red)
			})
			.finally(() => {
				application.server.close()
				assert.end()
			})
	})
})
