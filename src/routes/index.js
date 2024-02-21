import { Router } from 'express'
import {getDevicesController, postDevicesController, putDevicesController, deleteDevicesController } from "../controllers/devicesController.js"
import { addLinks } from '../utils/links.js'
import { linkRoutes } from '../index.js'
import { sendOkResponse, sendCreatedResponse, sendResponseNoContent } from '../utils/responses.js'
import { indexController } from '../controllers/indexController.js'
import { check, param, query } from 'express-validator'

export default (config) => {

	const routes = Router()
	const hasAddLinks = config.environment !== 'production'

	routes.get(
		'/',
		indexController,
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendOkResponse(result, req, res)
	)

	routes.get(
		'/devices',
		[
			query('uuid').optional({ nullable: true }).isString(),
		],
		(req, res, next) => getDevicesController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendOkResponse(result, req, res)
	)


	routes.post(
		'/device',
		[
			check('name').isString(),
			check('type').isString(),
			check('brand').isString(),
			check('model').isString(),
			check('registration_date').optional({ nullable: true }).isString(),
			check('status').optional({ nullable: true }).isString(),
		],
		(req, res, next) => postDevicesController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendCreatedResponse(result, req, res)
	)

	routes.put(
		'/device/:uuid',
		[param('uuid').isString(), check('name').isString()],
		(req, res, next) => putDevicesController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendCreatedResponse(result, req, res)
	)

	routes.delete(
		'/device/:uuid',
		[param('uuid').isString()],
		( req, res, next) => deleteDevicesController(req, res, next, config),
		(result, req, res, next) => sendResponseNoContent(result, req, res)
	)

    return routes
}