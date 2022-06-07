const fs = require('fs')
const path = require('path')
const swaggerUI = require('swagger-ui-express')
const jsYaml = require('js-yaml')

const OpenApiValidator = require('express-openapi-validator')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const Redis = require('ioredis')
const policies = require('./utils/policies')

const openApiPath = path.join(__dirname, 'api', 'openapi.yaml')
const schema = jsYaml.load(fs.readFileSync(openApiPath))
const morgan = require('morgan')

const app = express()
const server = require('http').createServer(app)

const whitelist = ['http://localhost:9090', 'http://localhost:8091']

app.use(cors({ credentials: true, origin: whitelist }))
app.use(helmet())
app.use(compression())
app.use(express.json({ limit: '50mb' }))
app.use(express.text())
app.use(express.urlencoded({ extended: true }))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

if (!process.env.DEV_USER) {
    const redisClient = new Redis(`${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
}

// eslint-disable-next-line new-cap
const router = express.Router()

router.use('/api-doc', swaggerUI.serve, swaggerUI.setup(schema))
if (!process.env.DEV_USER) {
    router.use(unless(['/health'], policies.checkLogin))
}
router.use(
    OpenApiValidator.middleware({
        apiSpec: openApiPath,
        validateRequests: true,
        validateResponses: false,
        operationHandlers: path.join(__dirname),
    }),
)

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
    console.error(err)
    // format errors
    res.status(err.status || 500).json({
        message: err.message || err,
        errors: err.errors || '',
    })
})

app.use('/api/v1', router)
app.use('/', router)

// tool function
function unless(paths, middleware) {
    return (req, res, next) => {
        if (paths.includes(req.path)) {
            return next()
        }
        return middleware(req, res, next)
    }
}

module.exports = { server, app }
