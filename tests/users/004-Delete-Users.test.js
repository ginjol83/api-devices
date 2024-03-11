import test from 'tape'
import request from 'supertest'
import { app, server, initApp } from '../../src/index.js'
import colors from "colors";



test('-------- Endpoint: DELETE /user/:uuid'.blue, assert => {
	initApp.then(application => {
		const expectedCode = 204
		const messageForExpectedCode = `Status code should be ${expectedCode}`.green
		const expectedCodeGetDeletedAddress = 404
		const mesaggeForExpectedDeletedCode = 'User should be removed from the database'.green

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
					.delete(`/user/${uuid}`)
					.send()
					.expect(expectedCode)
					.then(() => {
						assert.pass(messageForExpectedCode)
						return req
							.get(`/users/${uuid}`)
							.expect(expectedCodeGetDeletedAddress)
							.then(() => {
								assert.pass(mesaggeForExpectedDeletedCode)
							})
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
