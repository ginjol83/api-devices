import { getDevicesModel, insertDevicesModel, modifyDevicesModel, deleteDevicesModel } from "../models/devicesModel.js"
import { errorHandler } from '../utils/errors.js'
import { saveErrorLog } from '../services/errorLogService.js'
import mysql from "../adapters/mysql.js"

const getDevicesController = (req, res, next, config) => {
	const conn = mysql.start(config)
	const uuidDevice = req.query.uuid

	const params = { uuidDevice }
	const result = getDevicesModel({ conn, params })
	result.then((response) => {
		const _data = response

		next({ _data })
	})
		.catch((err) => {
			const errResponse = err.response || { status: 500 }
			const error = errorHandler(
				{
					err: errResponse.error,
					message: (errResponse.data && (errResponse.data || {}).message) || err.message || 'Server Error'
				},
				config.environment
			)
			saveErrorLog({ req, config, err })
			res.status(errResponse.status).json(error)
		})
}

const postDevicesController = (req, res, next, config) => {
	const conn = mysql.start(config)

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