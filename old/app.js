/* global CONTROLLERS_PATH */

require('./config/initializers/global_paths')
const ApiBuilder = require('claudia-api-builder')
const api = new ApiBuilder()

const auditTrailController = require(`${CONTROLLERS_PATH}/audit_trail_controller`)

api.get('/v1/audit_trails', auditTrailController.index)
