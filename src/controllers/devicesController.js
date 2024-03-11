import { getDevicesModel, insertDevicesModel, modifyDevicesModel, deleteDevicesModel, countDevicesModel } from "../models/devicesModel.js"
import { errorHandler } from '../utils/errors.js'
import { saveErrorLog } from '../services/errorLogService.js'
import mysql from "../adapters/mysql.js"

const getDevicesController = (req, res, next, config) => {
	const conn = mysql.start(config)
	const uuidDevice =  req.params.uuidDevice
	Promise.all([
		getDevicesModel({...req.query, uuidDevice, conn }),
		countDevicesModel({ ...req.query, conn })
	])
		.then(([getResults, countResults]) =>
			next({
				_data: { devices: getResults },
				_page: {
					totalElements: countResults,
					limit: req.query.limit || 1,
					page: req.query.page || (countResults && 100) || 0
				}
			})
		)
		.catch(err => {
			const error = errorHandler(err, config.environment)
			res.status(error.code).json(error)
		})
		.finally(() => {
			mysql.end(conn)
		})
}

const postDevicesController = (req, res, next, config) => {
	const conn = mysql.start(config)
	
	if(req.body.registration_date){
		const date = new Date(req.body.registration_date);
		req.body.registration_date = date.toISOString().split('T')[0];
	}
	
	
	insertDevicesModel({ ...req.body, conn })
		.then(devices => {
			if (devices){
				const result = {
					_data: { devices }
				}
				next(result)
			}else{
				throw new Error("BAD_REQUEST")
			}
			
		})
		.catch(err => {
			const errResult = err.message === "BAD_REQUEST" ? {message:err.message ,code:'BAD_REQUEST'} : err
			const error = errorHandler(errResult, config.environment)
			res.status(error.code).json(error)
		})
		.finally(() => {
			mysql.end(conn)
		})
}

const putDevicesController = (req, res, next, config) => {
	const conn = mysql.start(config)
	const uuid = req.params.uuid

	if(req.body.registration_date){
		const date = new Date(req.body.registration_date);
		req.body.registration_date = date.toISOString().split('T')[0];
	}

	modifyDevicesModel({ ...req.body, uuid, conn })
		.then(devices => {
			const result = {
				_data: { devices }
			}
			next(result)
		})
		.catch(err => {
			const error = errorHandler(err, config.environment)
			res.status(error.code).json(error)
		})
		.finally(() => {
			mysql.end(conn)
		})
}

const deleteDevicesController = (req, res, next, config) => {
	const conn = mysql.start(config)
	const uuid = req.params.uuid

	deleteDevicesModel({ uuid, conn })
		.then(() => {
			const result = {}
			next(result)
		})
		.catch(err => {
			const error = errorHandler(err, config.environment)
			res.status(error.code).json(error)
		})
		.finally(() => {
			mysql.end(conn)
		})
}

export { getDevicesController, postDevicesController, putDevicesController, deleteDevicesController }