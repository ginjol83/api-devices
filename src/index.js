import express from 'express'
import configuration from './config/index.js'
import bodyParser from 'body-parser'
import routes from './routes/index.js'
import file from 'fs'
import https from 'https'
import { error404, errorHandler } from './utils/errors.js'
import { getRoutes } from './utils/links.js'
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import confSwagger from '../swaggerConfig.js';
import colors from "colors";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

// CONFIGURATION ------------------------------------------------------------------------------------

const initApp = configuration(app).then(configuration => {
	
	const config = configuration
	const port = config.port

	// MIDDLEWARE ---------------------------------------------------------------------------------------
	
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(confSwagger)); //Swagger middleware

	app.use(bodyParser.json({
		limit: process.env.APP_BODY_LIMIT || config.bodyLimit
	}))

	app.use(bodyParser.urlencoded({
		extended: false
	}))

	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*')
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Client-Version')
		res.header('Module-Version', process.env.npm_package_version)
		next()
	})

	// ROUTES --------------------------------------------------------------------------------------------
	const r1 = routes(config)

	const links1 = getRoutes({ prefix: '', routes: r1.stack })
	const linkRoutes = { ...links1 }

	app.use('/', routes(config))

	// APPLICATION LAUNCHER ------------------------------------------------------------------
	// 404 - Not found
	app.use(function (req, res) {
		const err = error404()
		const error = errorHandler({ err, code: 'NOT_FOUND' }, config.environment)
		res.status(error.code).json(error)
	})

	let server = {}

	if (app.get('env') === 'production') {
		// SSL termination is done on OVH servers/load-balancers before the traffic gets to the application.
		// So in production, Heroku is in charge of HTTPS.

		server = app.listen(process.env.PORT || config.port, () => {
			const listeningPort = process.env.PORT || config.port
			console.log('Server listening on port ' + listeningPort .green)
		})
	} else {
		// In other environment, we are in charge of managing HTTPS connections

		const httpsOptions = {
			key: file.readFileSync(__dirname + '/../key.pem'),
			cert: file.readFileSync(__dirname + '/../cert.pem')
		}

		server = https.createServer(httpsOptions, app).listen(port, () => {
			console.log(`Server listening on port ${port}`.green)
		})
	}
	return { app, server, linkRoutes }
})

const linkRoutes = initApp.linkRoutes
const server = initApp.server

export { app, server, linkRoutes, initApp }