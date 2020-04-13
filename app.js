/* global CONTROLLERS_PATH */
require('./config/initializers/global_paths')

const auditTrailController = require(`${CONTROLLERS_PATH}/audit_trail_controller`)

api.get('/v1/audit_trails', auditTrailController.index)
