import { getDevicesQuery } from "../repositories/devicesRepository.js"
import moment from 'moment'
import mysql from "../adapters/mysql.js"

const getDevicesModel = ({ conn, ...rest }) => {
	const now = moment.utc().format('YYYY-MM-DD HH:mm:ss')
	const paramsToSearch = { ...rest, now }
	return mysql
		.execute(getDevicesQuery(paramsToSearch), conn, paramsToSearch)
        .then(queryResult => queryResult.map(({id, ...resultFiltered }) => resultFiltered))
}

const insertDevicesModel = ({ conn, ...params }) => {
	const uuid = uuidv4()
	const now = moment.utc().format('YYYY-MM-DD HH:mm:ss')

	return mysql
		.execute(insertDevicesQuery({ ...params, uuid, now }), conn, { ...params, uuid, now })
		.then(queryResult => queryResult[1].map(({ ...resultFiltered }) => resultFiltered))
}

export {getDevicesModel, insertDevicesModel}