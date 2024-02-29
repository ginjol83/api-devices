import { getUsersQuery, insertUsersQuery, modifyUsersQuery, deleteUsersQuery, countUsersQuery } from "../repositories/usersRepository.js"
import moment from 'moment'
import mysql from "../adapters/mysql.js"
import { v4 as uuidv4 } from 'uuid'

const getUsersModel = ({ conn, ...rest }) => {
	const now = moment.utc().format('YYYY-MM-DD HH:mm:ss')
	const paramsToSearch = { ...rest, now }

	return mysql
		.execute(getUsersQuery(paramsToSearch), conn, paramsToSearch)
        .then(Result => Result.map(({id, ...resultFiltered }) => resultFiltered))
}

const countUsersModel = ({ conn, ...rest }) => {
	const now = moment.utc().format('YYYY-MM-DD HH:mm:ss')
	const paramsToSearch = { ...rest, now }

	return mysql
		.execute(countUsersQuery(paramsToSearch), conn, paramsToSearch)
		.then(results => results[0].count)
}

const insertUsersModel = ({ conn, ...params }) => {
	const uuid = uuidv4()
	const now = moment.utc().format('YYYY-MM-DD HH:mm:ss')

	const requiredFields = params.name && params.type && params.brand && params.model && params.registration_date && params.status
	
	if(!requiredFields) { 
		return Promise.resolve()
	}

	return mysql
			.execute(insertUsersQuery({ ...params, uuid, now }), conn, { ...params, uuid, now })
			.then(queryResult => queryResult[1].map(({ ...resultFiltered }) => resultFiltered))
		
}

const modifyUsersModel = ({ conn, ...params }) => {
	return mysql
		.execute(modifyUsersQuery(params), conn, params)
		.then(queryResult => queryResult[1].map(({ id, ...resultFiltered }) => resultFiltered))
}

const deleteUsersModel = ({ uuid, conn }) => {
	const params = { uuid }

	return mysql
		.execute(deleteUsersQuery(params), conn, params)
}

export { getUsersModel, insertUsersModel, modifyUsersModel, deleteUsersModel, countUsersModel }