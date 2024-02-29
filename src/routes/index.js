import { Router } from 'express'
import { getDevicesController, postDevicesController, putDevicesController, deleteDevicesController } from "../controllers/devicesController.js"
import { getUsersController, postUsersController, putUsersController, deleteUsersController } from "../controllers/usersController.js"
import { addLinks } from '../utils/links.js'
import { linkRoutes } from '../index.js'
import { sendOkResponse, sendCreatedResponse, sendResponseNoContent } from '../utils/responses.js'
import { indexController } from '../controllers/indexController.js'
import { check, param, query, body } from 'express-validator'
import { payloadExpressValidator } from '../validators/payloadExpressValidator.js'

export default (config) => {

	const routes = Router()
	const hasAddLinks = config.environment !== 'production'

	/**
	 * @swagger
	 * /:
	 *   get:
	 *     summary: Home page of the API.
	 *     tags: [General]
	 *     responses:
	 *       200:
	 *         description: Shows a welcome message or basic information about the API.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 message:
	 *                   type: string
	 *                   description: A welcome message or basic information about the API.
	 */
	routes.get(
		'/',
		indexController,
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendOkResponse(result, req, res)
	)
	

	/**
	 * @swagger
	 * /devices:
	 *   get:
	 *     summary: Lists all devices or searches by UUID.
	 *     tags: [Device]
	 *     parameters:
	 *       - in: query
	 *         name: uuid
	 *         schema:
	 *           type: string
	 *         required: false
	 *         description: Optional UUID to filter the search for a specific device.
	 *     responses:
	 *       200:
	 *         description: A list of devices. Returns a single device if the UUID is specified.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   id:
	 *                     type: string
	 *                     description: The unique ID of the device.
	 *                   name:
	 *                     type: string
	 *                     description: The name of the device.
	 *                   type:
	 *                     type: string
	 *                     description: The type of device.
	 *                   brand:
	 *                     type: string
	 *                     description: The brand of the device.
	 *                   model:
	 *                     type: string
	 *                     description: The model of the device.
	 *                   registration_date:
	 *                     type: string
	 *                     format: date
	 *                     description: The registration date of the device.
	 *                   status:
	 *                     type: string
	 *                     description: The current status of the device.
	 */

	routes.get(
		'/devices',
		[
			query('uuid').optional({ nullable: true }).isString(),
		],
		(req, res, next) => getDevicesController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendOkResponse(result, req, res)
	)

	/**
	 * @swagger
	 * /devices/{uuid}:
	 *   get:
	 *     summary: Retrieves a device by its UUID.
	 *     tags: [Device]
	 *     parameters:
	 *       - in: path
	 *         name: uuid
	 *         required: true
	 *         schema:
	 *           type: string
	 *         description: The unique ID of the device to retrieve.
	 *     responses:
	 *       200:
	 *         description: Device retrieved successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 id:
	 *                   type: string
	 *                   description: The unique ID of the device.
	 *                 name:
	 *                   type: string
	 *                   description: The name of the device.
	 *                 type:
	 *                   type: string
	 *                   description: The type of device.
	 *                 brand:
	 *                   type: string
	 *                   description: The brand of the device.
	 *                 model:
	 *                   type: string
	 *                   description: The model of the device.
	 *                 registration_date:
	 *                   type: string
	 *                   format: date
	 *                   description: The registration date of the device.
	 *                 status:
	 *                   type: string
	 *                   description: The current status of the device.
	 *       404:
	 *         description: Device not found.
	 */
	routes.get(
		'/devices/:uuid',
		(req, res, next) => getDevicesController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendOkResponse(result, req, res)
	)

	/**
	 * @swagger
	 * /device:
	 *   post:
	 *     summary: Creates a new device.
	 *     tags: [Device]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - name
	 *               - type
	 *               - brand
	 *               - model
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 description: The name of the device.
	 *               type:
	 *                 type: string
	 *                 description: The type of device.
	 *               brand:
	 *                 type: string
	 *                 description: The brand of the device.
	 *               model:
	 *                 type: string
	 *                 description: The model of the device.
	 *               registration_date:
	 *                 type: string
	 *                 format: date
	 *                 description: The registration date of the device. Optional.
	 *               status:
	 *                 type: string
	 *                 description: The current status of the device. Optional.
	 *     responses:
	 *       201:
	 *         description: Device created successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 id:
	 *                   type: string
	 *                   description: The unique ID of the created device.
	 *                 name:
	 *                   type: string
	 *                 type:
	 *                   type: string
	 *                 brand:
	 *                   type: string
	 *                 model:
	 *                   type: string
	 *                 registration_date:
	 *                   type: string
	 *                   format: date
	 *                 status:
	 *                   type: string
	 */
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

	/**
	 * @swagger
	 * /device/{uuid}:
	 *   put:
	 *     summary: Updates an existing device.
	 *     tags: [Device]
	 *     parameters:
	 *       - in: path
	 *         name: uuid
	 *         required: true
	 *         schema:
	 *           type: string
	 *         description: The unique ID of the device to update.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 description: The new name of the device.
	 *               type:
	 *                 type: string
	 *                 description: The new type of the device.
	 *               brand:
	 *                 type: string
	 *                 description: The new brand of the device.
	 *               model:
	 *                 type: string
	 *                 description: The new model of the device.
	 *               registration_date:
	 *                 type: string
	 *                 format: date
	 *                 description: The new registration date of the device. Optional.
	 *               status:
	 *                 type: string
	 *                 description: The new status of the device. Optional.
	 *     responses:
	 *       200:
	 *         description: Successfully updated the device.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 id:
	 *                   type: string
	 *                   description: The unique ID of the updated device.
	 *                 name:
	 *                   type: string
	 *                 type:
	 *                   type: string
	 *                 brand:
	 *                   type: string
	 *                 model:
	 *                   type: string
	 *                 registration_date:
	 *                   type: string
	 *                   format: date
	 *                 status:
	 *                   type: string
	 */
	routes.put(
		'/device/:uuid',
		[
			param('uuid').isString(), 
			body('name').optional({ nullable: true }).isString(),
			check('type').optional({ nullable: true }).isString(),
			check('brand').optional({ nullable: true }).isString(),
			check('model').optional({ nullable: true }).isString(),
			check('registration_date').optional({ nullable: true }).isString(),
			check('status').optional({ nullable: true }).isString()],
		(req, res, next) => payloadExpressValidator(req, res, next, config),
		(req, res, next) => putDevicesController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendCreatedResponse(result, req, res)
	)

	/**
	 * @swagger
	 * /device/{uuid}:
	 *   delete:
	 *     summary: Deletes a specific device.
	 *     tags: [Device]
	 *     parameters:
	 *       - in: path
	 *         name: uuid
	 *         required: true
	 *         schema:
	 *           type: string
	 *         description: The unique ID of the device to delete.
	 *     responses:
	 *       204:
	 *         description: Successfully deleted the device.
	 */
	routes.delete(
		'/device/:uuid',
		[param('uuid').isString()],
		(req, res, next) => deleteDevicesController(req, res, next, config),
		(result, req, res, next) => sendResponseNoContent(result, req, res)
	)




/*********************************************************************************************** */



	routes.get(
		'/users',
		[
			query('uuid').optional({ nullable: true }).isString(),
		],
		(req, res, next) => getUsersController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendOkResponse(result, req, res)
	)

	routes.get(
		'/users/:uuid',
		(req, res, next) => getUsersController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendOkResponse(result, req, res)
	)

	routes.post(
		'/user',
		[
			check('name').isString(),
		],
		(req, res, next) => postUsersController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendCreatedResponse(result, req, res)
	)

	routes.put(
		'/user/:uuid',
		[
			param('uuid').isString(), 
		],
		(req, res, next) => payloadExpressValidator(req, res, next, config),
		(req, res, next) => putUsersController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendCreatedResponse(result, req, res)
	)

	routes.delete(
		'/user/:uuid',
		[param('uuid').isString()],
		(req, res, next) => deleteUsersController(req, res, next, config),
		(result, req, res, next) => sendResponseNoContent(result, req, res)
	)

	return routes
}