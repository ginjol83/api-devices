import { validationResult } from 'express-validator'
import { errorHandler } from '../utils/errors.js'

const payloadExpressValidator = (req, res, next, config) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const badRequest = errors.array().find(val => undefined === val.value)

		if (badRequest) {
			const errorMessage = errorHandler({ errors: errors.array(), code: 'BAD_REQUEST' }, config.environment)
			return res.status(errorMessage.code).json(errorMessage)
		}

		const error = errorHandler({ errors: errors.array(), code: 'UNPROCESSABLE_ENTITY' }, config.environment)
		return res.status(error.code).json(error)
	}

	next()
}

export { payloadExpressValidator }