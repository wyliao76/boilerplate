/* global SERVICES_PATH */

const AuditTrailService = require(`${SERVICES_PATH}/audit_trails`)
const requestValidate = require(`${SERVICES_PATH}/request_validate`)

exports.index = async (req) => {
  try {
    const validateResult = requestValidate.validate(req.queryString, {
      page: {
        presence: true,
        numericality: true
      },
      per_page: {
        presence: true,
        numericality: true
      },
      sort: {
        type: 'string'
      },
      record_type: {
        type: 'string'
      }
    })

    if (!validateResult.status) {
      return { code: 422, result: validateResult.result }
    }
    const result = await AuditTrailService.index(req)
    // console.log('[AuditTrails][Index]: ', result)
    return result
  } catch (err) {
    console.log('[AuditTrails][Index][Error]: ', err)
  }
}
