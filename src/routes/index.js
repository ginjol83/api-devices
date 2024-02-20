import { Router } from 'express'
import {getDevicesController, postDevicesController} from "../controllers/devicesController.js"
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
		//(req, res, next) => payloadExpressValidator(req, res, next, config), //TODO
		(req, res, next) => getDevicesController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendOkResponse(result, req, res)
	)


	routes.post(
		'/job',
		[
			check('dateCreation').custom(isValidDate),
			check('operationTypesUuid').isString(),
			check('shipmentTypesUuid').isString(),
			check('loadTypesUuid').isString(),
			check('departmentsUuid').isString(),
			check('organizationalAreasUuid').optional({ nullable: true }).isString(),
			check('partyFirstLevelUuid').optional({ nullable: true }).isString(),
			check('partyParentCompanyUuid').optional({ nullable: true }).isString(),
			check('partyGroupedDelegationUuid').optional({ nullable: true }).isString(),
			check('partyTaxDelegationUuid').optional({ nullable: true }).isString(),
			check('partyBusinessUnitUuid').optional({ nullable: true }).isString(),
			check('partyInvoicingBusinessUnitUuid').optional({ nullable: true }).isString(),

			check('bookingConfirmationChartNotes').optional({ nullable: true }).isString()
	
		],
		//(req, res, next) => payloadExpressValidator(req, res, next, config), //TODO
		(req, res, next) => postDevicesController(req, res, next, config),
		(result, req, res, next) => addLinks(result, req, res, next, hasAddLinks, linkRoutes),
		(result, req, res, next) => sendCreatedResponse(result, req, res)
	)

    return routes
}