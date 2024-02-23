import test from 'tape'
import request from 'supertest'
import { app, server, initApp } from '../../src/index.js'
import colors from "colors";


test('-------- Endpoint: PUT /device/:uuid'.blue, assert => {
	initApp.then(application => {
		const expectedCode = 201
		const messageForExpectedCode = `Status code should be ${expectedCode}`.green
		const newDevice = {
			name: "Test Device" + Date.now(),
			type: "Smartphone" + Date.now(),
			brand: "Test Brand" + Date.now(),
			model: "Test Model" + Date.now(),
			registration_date: "2024-02-22",
			status: "Active"
		}
		const updateDevice = {
			name: "Test Device Modified" + Date.now(),
			type: "Smartphone Modified" + Date.now(),
			brand: "Test Brand Modified" + Date.now(),
			model: "Test Model Modified" + Date.now(),
			status: "Active  Modified"
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
					.put(`/device/${uuid}`)
					.send(updateDevice)
					.expect(expectedCode)
					.then(res => {
						assert.pass(messageForExpectedCode)
						assert.deepEqual(res.body._data.devices[0].name, updateDevice.name, `Modified device's name should be ${updateDevice.name}`.green)
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


test('-------- Endpoint: PUT /device/:uuid (422 - Unprocessable entity )'.blue, assert => {
	initApp.then(application => {
		const expectedCode = 422
		const messageForExpectedCode = `Status code should be ${expectedCode}`.green
		const newDevice = {
			name: "Test Device" + Date.now(),
			type: "Smartphone" + Date.now(),
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
					.put(`/device/${uuid}`)
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
