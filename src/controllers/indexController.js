const indexController = (req, res, next) => {
	const result = {
		_data: {
			message: 'Server up!'
		}
	}

	next(result)
}

export { indexController }
