import test from 'tape'
import request from 'supertest'
import { app, server, initApp } from '../../src/index.js'
import colors from "colors";


test('-------- Endpoint: PUT /user/:uuid'.blue, assert => {
	initApp.then(application => {
		const expectedCode = 201
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
	
		const updateUser = {
			name: "Test User MODIFIED "+Date.now(),
			username: "Test username MODIFIED "+ Date.now(),
			password: "Test password MODIFIED "+ Date.now(),
			email: "Test email MODIFIED "+ Date.now(),
			role : "Test role MODIFIED "+ Date.now(),
			bio: "Test bio MODIFIED "+ Date.now(),
			avatar : "Test avatar MODIFIED "+ Date.now(),
		}

		const req = request(application.app)
		req
			.post('/user')
			.send(newUser)
			.expect(201)
			.then(response => {
				const uuid = response.body._data.users[0].uuid
				return uuid
			})
			.then(uuid => {
				return req
					.put(`/user/${uuid}`)
					.send(updateUser)
					.expect(expectedCode)
					.then(res => {
						assert.pass(messageForExpectedCode)
						assert.deepEqual(res.body._data.users[0].name, updateUser.name, `Modified user's name should be ${updateUser.name}`.green)
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


test('-------- Endpoint: PUT /user/:uuid (422 - Unprocessable entity )'.blue, assert => {
	initApp.then(application => {
		const expectedCode = 422
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
	

		const req = request(application.app)
		req
			.post('/user')
			.send(newUser)
			.expect(201)
			.then(response => {
				const uuid = response.body._data.users[0].uuid
				return uuid
			})
			.then(uuid => {
				return req
					.put(`/user/${uuid}`)
					.send({
						name: 123
					})
					.expect(expectedCode)
					.then(() => assert.pass(messageForExpectedCode))
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
