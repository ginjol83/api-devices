import { getUsersModel, insertUsersModel, modifyUsersModel, deleteUsersModel, countUsersModel } from "../models/usersModel.js"
import { errorHandler } from '../utils/errors.js'
import { saveErrorLog } from '../services/errorLogService.js'
import mysql from "../adapters/mysql.js"

const getUsersController = (req, res, next, config) => {
	const conn = mysql.start(config)

	Promise.all([
		getUsersModel({ ...req.query, conn }),
		countUsersModel({ ...req.query, conn })
	])
		.then(([getResults, countResults]) =>
			next({
				_data: { users: getResults },
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

const postUsersController = (req, res, next, config) => {
	const conn = mysql.start(config)

	const date = new Date(req.body.registration_date);
	req.body.registration_date = date.toISOString().split('T')[0];
	
	insertUsersModel({ ...req.body, conn })
		.then(users => {
			if (users){
				const result = {
					_data: { users }
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

const putUsersController = (req, res, next, config) => {
	const conn = mysql.start(config)
	const uuid = req.params.uuid

	const date = new Date(req.body.registration_date);
	req.body.registration_date = date.toISOString().split('T')[0];

	modifyUsersModel({ ...req.body, uuid, conn })
		.then(users => {
			const result = {
				_data: { users }
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

const deleteUsersController = (req, res, next, config) => {
	const conn = mysql.start(config)
	const uuid = req.params.uuid

	deleteUsersModel({ uuid, conn })
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

export { getUsersController, postUsersController, putUsersController, deleteUsersController }