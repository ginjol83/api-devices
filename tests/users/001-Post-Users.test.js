import test from 'tape'
import request from 'supertest'
import { initApp } from '../../src/index.js'
import colors from "colors";

console.log("############ TEST  /user endpoints ############".bgRed)

test('-------- Endpoint: POST /user'.blue, assert => {
	const expectedCode = 201
	const messageForExpectedCode = `Status code should be ${expectedCode}`.green
	const messageForExpectedResult = `Inserted user's name should be ${'test' + Date.now()}`.green
	const newUsers = {
		name: "Test User"+Date.now(),
		username: "Test username"+ Date.now(),
		password: "Test password"+ Date.now(),
		email: "Test email"+ Date.now(),
		role : "Test role "+ Date.now(),
		bio: "Test bio"+ Date.now(),
		avatar : "Test avatar "+ Date.now(),
	}

	initApp.then(application => {
		request(application.app)
		.post('/user')
		.send(newUsers)
		.expect(expectedCode)
		.then(res => {
			assert.pass(messageForExpectedCode)
			assert.deepEqual(res.body._data.users[0].name, newUsers.name, messageForExpectedResult)
		})
		.catch(err => {
			assert.fail(err.message .red)
		})
		.finally(() => {
			application.server.close()
			assert.end()
		})
	})
})


test('-------- Endpoint: POST /user (400 - Bad Request -)'.blue, assert => {
	const expectedCode = 400
	const messageForExpectedCode = `Status code should be ${expectedCode}`.green
	const newUsers = {}

	initApp.then(application => { 
	request(application.app)
		.post('/user')
		.send(newUsers)
		.expect(expectedCode)
		.then(res => {
			assert.pass(messageForExpectedCode)
		})
		.catch(err => {
			assert.fail(err.message)
		})
		.finally(() => {
			application.server.close()
			assert.end()
		})
	})
})

