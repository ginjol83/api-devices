import { getDevicesModel, insertDevicesModel } from "../models/devicesModel.js"
import { errorHandler } from '../utils/errors.js'
import { saveErrorLog } from '../services/errorLogService.js'
import mysql from "../adapters/mysql.js"


const getDevicesController = (req, res, next, config) => {
    config.then( configuration=> {
        const conn = mysql.start(configuration)        
        const result = getDevicesModel({conn})
        result.then((response) => {
			const  _data  = response

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
    })
}

const postDevicesController = (req, res, next, config) => {
	const conn = mysql.start(config)
	const createdby = req.headers['uuid-requester'] || null
	const bookingChecksUuid = req.params.uuid
	const field = req.params.field

	insertDevicesModel({ bookingChecksUuid, field, ...req.body, createdby, conn })
		.then(bookingChecksAmendments => {
			const result = {
				_data: { bookingChecksAmendments }
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




export { getDevicesController, postDevicesController }