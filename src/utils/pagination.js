const pagination = ({ limit = 100, page = 1 }) => {
	const validateLimit = Math.abs(limit).toString() === 'NaN' ? 100 : limit
	const validatePage = Math.abs(page).toString() === 'NaN' ? 1 : page

	const auxPage = parseInt(validatePage) === 0 ? 1 : parseInt(validatePage)
	const auxLimit = Math.abs(parseInt(validateLimit))

	const offset = (Math.abs(auxPage) - 1) * auxLimit
	return ` LIMIT ${auxLimit} OFFSET ${offset} `
}

export { pagination }
