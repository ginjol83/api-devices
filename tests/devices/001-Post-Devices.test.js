import test from 'tape'
import request from 'supertest'
import { initApp } from '../../src/index.js'
import colors from "colors";

console.log("############ TEST  /device endpoints ############".bgRed)

test('-------- Endpoint: POST /device'.blue, assert => {
	const expectedCode = 201
	const messageForExpectedCode = `Status code should be ${expectedCode}`.green
	const messageForExpectedResult = `Inserted device's name should be ${'test' + Date.now()}`.green
	const newDevices = {
		name: "Test Device"+Date.now(),
		type: "Smartphone"+Date.now(),
		brand: "Test Brand"+Date.now(),
		model: "Test Model"+Date.now(),
		registration_date: "2024-02-22",
		status: "Active"
	}

	initApp.then(application => {
		request(application.app)
		.post('/device')
		.send(newDevices)
		.expect(expectedCode)
		.then(res => {
			assert.pass(messageForExpectedCode)
			assert.deepEqual(res.body._data.devices[0].name, newDevices.name, messageForExpectedResult)
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


test('-------- Endpoint: POST /device (400 - Bad Request -)'.blue, assert => {
	const expectedCode = 400
	const messageForExpectedCode = `Status code should be ${expectedCode}`.green
	const newDevices = {}

	initApp.then(application => { 
	request(application.app)
		.post('/device')
		.send(newDevices)
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

