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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

// CONFIGURATION ------------------------------------------------------------------------------------
const config = configuration(app).then(ret=>ret)

// MIDDLEWARE ---------------------------------------------------------------------------------------

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
		console.log('Server listening on port ' + listeningPort)
	})
} else {
	// In other environment, we are in charge of managing HTTPS connections

	const httpsOptions = {
		key: file.readFileSync(__dirname + '/../key.pem'),
		cert: file.readFileSync(__dirname + '/../cert.pem')
	}
	//TODO
	const port = 3000
	server = https.createServer(httpsOptions, app).listen(port, () => { //process.env.port || config.port, () => {
		console.log(`Server listening on port ${port}`)//process.env.port || config.port}`)
	})
}

export { app, server, linkRoutes }
