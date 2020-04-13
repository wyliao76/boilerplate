/* global SERVICES_PATH, MODELS_PATH */

'use strict'
require('../config/initializers/global_paths')
require('dotenv-json')({ path: `env.${process.env.ENV_JSON}.json` })
const db = require(`${MODELS_PATH}/index`)
const AuditTrails = db.audit_trails
const utilities = require(`${SERVICES_PATH}/utilities`)

async function main () {
  const hrstart = process.hrtime()

  const auditTrailDict = await AuditTrails.findAll({
    raw: true,
    attributes: ['id', 'model']
  }).then(auditTrails => auditTrails.reduce((map, auditTrail) => {
    map[auditTrail.id] = getRecordType(auditTrail.model)
    return map
  }, {}))
  // console.log(auditTrailDict)

  const resutls = (await Promise.all(
    Object.keys(auditTrailDict).map(key => AuditTrails.update({ record_type: auditTrailDict[key] }, { where: { id: key } }))
  ))
    .flat()
    .reduce(utilities.reducer, 0)
  console.log(resutls)

  const hrend = process.hrtime(hrstart)
  console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
}

const getRecordType = (modelName) => {
  switch (modelName) {
    case 'admins':
      return 'admin'
    case 'admin_groups':
    case 'admin_groups_customers':
      return 'admin_group'
    case 'paperless_records':
      return 'paperless'
    case 'tenants':
    case 'tenant_rent_pacts':
      return 'tenant'
    case 'tenant_users':
    case 'tenant_user_invites':
    case 'tenant_user_units':
      return 'tenant_user'
    default:
      return ''
  }
}

main()
