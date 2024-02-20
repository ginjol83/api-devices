//import { postErrorLogsModel } from '../models/logs/errorLogsModel.js'

const saveErrorLog = ({ req, config, err }) => {
	// create headers
	const headers = { 'uuid-requester': req?.auth?.user?.uuid || req?.body?.username || '' }

	// remove password from the input and convert input to a string
	const input = JSON.stringify({ ...req?.body, password: undefined })

	// create body
	const body = {
		method: req?.method,
		route: req?.url.substring(0, 254),
		userUuid: req?.auth?.user?.uuid || 'Login Error',
		input,
		statusCode: err?.response?.status || 500,
		errorTitle: err?.response?.data?.message || 'Unhandled Error',
		errorMessage: err?.response?.data?.error ? JSON.stringify(err?.response?.data?.error) : err?.message,
		errorStack: err?.stack,
		errorUrl: err?.config?.url
	}

	console.error(JSON.stringify({
		error_message: body.errorMessage,
		error_url: body.errorUrl,
		error_status: body.statusCode,
		error_user: body.userUuid,
		error_method: body.method,
		error_input: body.input
	}))
/*
	// save error log
	postErrorLogsModel({ config, body, headers })
		.catch(error => {
			const isDev = config.environment !== 'production'
			if (isDev) return

			console.error(error?.message || error)
		})*/
}

export { saveErrorLog }
