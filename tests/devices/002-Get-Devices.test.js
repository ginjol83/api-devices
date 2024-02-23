import test from 'tape'
import request from 'supertest'
import { app, server, initApp } from '../../src/index.js'
import colors from "colors";


test('-------- Endpoint: GET /device'.blue, assert => {
	const expectedCode = 200
	const messageForExpectedCode = `Status code should be ${expectedCode}`.green
	const messageForExpectedResult = 'Response should be an array of devices with length longer than 0'.green

	initApp.then(application => {
		request(application.app)
			.get('/devices')
			.expect(expectedCode)
			.then(res => {
				assert.pass(messageForExpectedCode)
				const actualResult = res.body._data.length > 0
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

test('-------- Endpoint: GET /device?uuid=uuid'.blue, assert => {
	const expectedCode = 200
	const messageForExpectedCode = `Status code should be ${expectedCode}`.green
	const newDevice = {
		name: "Test Device" + Date.now(),
		type: "Smartphone" + Date.now(),
		brand: "Test Brand" + Date.now(),
		model: "Test Model" + Date.now(),
		registration_date: "2024-02-22",
		status: "Active"
	}
	const expectedResult = newDevice.name
	const messageForExpectedResult = `device name should be ${expectedResult}`.green

	initApp.then(application => {

		const req = request(application.app)

		req
			.post('/device')
			.send(newDevice)
			.expect(201)
			.then(res => {
				const uuid = res.body._data.devices[0].uuid

				return req
					.get(`/devices?uuid=${uuid}`)
					.expect(200)
					.then(res2 => {
						assert.pass(messageForExpectedCode)

						const actualResult = res2.body._data[0].name

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

test('-------- Endpoint: GET /device/:uuid (error 404)'.blue, assert => {
	const expectedCode = 404
	const uuidNotFound = 'ThisUuidDoesntExist'
	const messageForExpectedCode = `If uuid doesn\'t exist, status code should be ${expectedCode}`.green

	initApp.then(application => {
		request(application.app)
			.get(`/device/${uuidNotFound}`)
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
