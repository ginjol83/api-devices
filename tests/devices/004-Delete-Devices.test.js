import test from 'tape'
import request from 'supertest'
import { app, server, initApp } from '../../src/index.js'
import colors from "colors";



test('-------- Endpoint: DELETE /device/:uuid'.blue, assert => {
	initApp.then(application => {
		const expectedCode = 204
		const messageForExpectedCode = `Status code should be ${expectedCode}`.green
		const expectedCodeGetDeletedAddress = 404
		const mesaggeForExpectedDeletedCode = 'Device should be removed from the database'.green

		const newDevice = {
			name: "Test Device" + Date.now(),
			type: "Smartphone"  + Date.now(),
			brand: "Test Brand" + Date.now(),
			model: "Test Model" + Date.now(),
			registration_date: "2024-02-22",
			status: "Active"
		}

		const req = request(application.app)
		req
			.post('/device')
			.send(newDevice)
			.expect(201)
			.then(response => {
				const uuid = response.body._data.devices[0].uuid
				return uuid
			})
			.then(uuid => {
				return req
					.delete(`/device/${uuid}`)
					.send()
					.expect(expectedCode)
					.then(() => {
						assert.pass(messageForExpectedCode)
						return req
							.get(`/device/${uuid}`)
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
