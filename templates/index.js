const { serveHttp, app } = require('webfunc')

/**
 * Responds to any HTTP request.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
exports.{{entryPoint}} = serveHttp([
	app.get('/', (req, res) => res.status(200).send('Hello World')),
	app.get('/users/{userId}', (req, res, params) => res.status(200).send(`Hello user ${params.userId}`)),
	app.get('/users/{userId}/document/{docName}', (req, res, params) => res.status(200).send(`Hello user ${params.userId}. I like your document ${params.docName}`)),
])
