const addLinks = (result, req, res, next, hasAddLinks, routes) => {
	const links = { _links: routes }

	hasAddLinks ? next(Object.assign({}, links, result)) : next(result, req, res, next, routes)
}

const getRoutes = ({ prefix, routes }) => routes
	.filter(r => r.route)
	.reduce((acc, route) => {
		const capitalize = val => val.charAt(0).toUpperCase() + val.slice(1)
		const entity = route.route.path
			.split('/')
			.map(val => val.replace(':', ''))
			.map(val => val.replace('-', ''))
			.map(capitalize)
			.join('')

		const method = Object.keys(route.route.methods)[0]
		const newEndpoint = { [method + entity]: `${method.toUpperCase()} - ${prefix}${route.route.path}` }
		return { ...acc, ...newEndpoint }
	}, {})

export { addLinks, getRoutes }
