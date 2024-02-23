import moment from 'moment'

const isValidDate = (date = 'dateNotValid') => {
	if (date === null) {
		return true
	}
	return typeof date === 'string' && new Date(date).getTime() > 0 && moment(date).isValid()
}

export { isValidDate }
