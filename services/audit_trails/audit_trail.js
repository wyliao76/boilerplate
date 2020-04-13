/* global MODELS_PATH, SERVICES_PATH */

const db = require(`${MODELS_PATH}/index`)
const AuditTrails = db.audit_trails
const Admins = db.admins
const TenantUsers = db.tenant_users
const utilities = require(`${SERVICES_PATH}/utilities`)
const Op = require('sequelize').Op

exports.index = async (req, admin) => {
  const { per_page, page } = utilities.getPages(req)
  const params = {
    where: {},
    raw: true,
    attributes: {
      exclude: ['updated_at']
    },
    limit: per_page,
    offset: per_page * (page - 1),
    order: [orderParams(req.queryString.sort)]
  }
  const auditTrailFilterParams = auditTrailFilter(req)
  if (auditTrailFilterParams.length > 0) {
    params.where[Op.or] = auditTrailFilterParams
  }
  const [audit_trails, adminDict, tenantUserDict, customerDict, rentPactDict, unitDict] = await Promise.all([
    AuditTrails.findAndCountAll(params),
    getAdminDict(),
    getTenantUserDict(),
    getCustomerDict(),
    getRentPactDict(),
    getUnitDict()
  ])
  const data = audit_trails.rows.map(audit_trail =>
    processData(audit_trail, customerDict, rentPactDict, unitDict, adminDict, tenantUserDict))
  const count = audit_trails.count
  return {
    total: count,
    per_page: per_page,
    current_page: page,
    last_page: count % per_page !== 0 ? Math.ceil(count / per_page) : Math.floor(count / per_page),
    data: data
  }
}

function processData (audit_trail, customerDict, rentPactDict, unitDict, adminDict, tenantUserDict) {
  audit_trail['user'] = audit_trail.role === 'admin' ? adminDict[audit_trail.user_id] : tenantUserDict[audit_trail.user_id]
  const before = JSON.parse(audit_trail.previous_data)
  const after = JSON.parse(audit_trail.metadata)
  if (before) {
    if (before.customer_id) { before['vcustname'] = customerDict[before.customer_id]; delete before.customer_id }
    if (before.rent_pact_id) { before['vpactnum'] = rentPactDict[before.rent_pact_id]; delete before.rent_pact_id }
    if (before.unit_id) { before['unitname'] = unitDict[before.unit_id]; delete before.unit_id }
  }
  if (after) {
    if (after.customer_id) { after['vcustname'] = customerDict[after.customer_id]; delete after.customer_id }
    if (after.rent_pact_id) { after['vpactnum'] = rentPactDict[after.rent_pact_id]; delete after.rent_pact_id }
    if (after.unit_id) { after['unitname'] = unitDict[after.unit_id]; delete after.unit_id }
  }
  const { previous_data, metadata } = sanitizer(before, after)
  let response
  if (!previous_data && !metadata) {
    response = null
  } else if (!previous_data) {
    response = Object.keys(metadata).map(key => {
      return { field: key, before: 'null', after: metadata[key] }
    })
  } else if (!metadata) {
    response = Object.keys(previous_data).map(key => {
      return { field: key, before: previous_data[key], after: 'null' }
    })
  } else {
    response = Object.keys(metadata).map(key => {
      return { field: key, before: previous_data[key], after: metadata[key] }
    })
  }
  audit_trail.changes = response
  delete audit_trail.previous_data
  delete audit_trail.metadata
  delete audit_trail.target_id
  delete audit_trail.user_id
  return audit_trail
}

function sanitizer (before, after) {
  // console.log('before: ', before)
  // console.log('after: ', after)
  if (before && after) {
    delete after.updated_at
    const newBefore = {}
    const newAfter = {}
    for (const key of Object.keys(after)) {
      // console.log(`${key}: ${before[key]}`)
      // console.log(`${key}: ${after[key]}`)
      if (before[key] !== after[key]) {
        // console.log(`filtered ${key}: ${before[key]}`)
        // console.log(`filtered ${key}: ${after[key]}`)
        newBefore[key] = before[key]
        newAfter[key] = after[key]
      }
    }
    // console.log('newBefore: ', newBefore)
    // console.log('newAfter: ', newAfter)
    before = Object.entries(newBefore).length === 0 && newBefore.constructor === Object ? null : newBefore
    after = Object.entries(newAfter).length === 0 && newAfter.constructor === Object ? null : newAfter
  }
  return {
    previous_data: before,
    metadata: after
  }
}

function auditTrailFilter (req) {
  const result = []
  const { record_type } = req.queryString

  if (record_type) result.push({ record_type: record_type })

  return result
}

function orderParams (value) {
  if (!value) return ['created_at', 'DESC']
  const sort = value.toLowerCase()
  const list = [
    'id|desc',
    'id|asc',
    'model|desc',
    'model|asc',
    'action|desc',
    'action|asc',
    'role|desc',
    'role|asc',
    'created_at|asc'
  ]
  return list.includes(sort) ? sort.split('|') : ['created_at', 'DESC']
}

function getAdminDict () {
  return Admins.findAll({
    raw: true,
    attributes: ['id', 'email']
  }).then(results => results.reduce((map, result) => {
    map[result.id] = result.email
    return map
  }, {}))
}

function getTenantUserDict () {
  return TenantUsers.findAll({
    raw: true,
    attributes: ['id', 'username']
  }).then(results => results.reduce((map, result) => {
    map[result.id] = result.username
    return map
  }, {}))
}

function getCustomerDict () {
  return db.customers.findAll({
    raw: true,
    attributes: ['customer_id', 'vcustname']
  }).then(results => results.reduce((map, result) => {
    map[result.customer_id] = result.vcustname
    return map
  }, {}))
}

function getRentPactDict () {
  return db.rent_pacts.findAll({
    raw: true,
    attributes: ['rent_pact_id', 'vpactnum']
  }).then(results => results.reduce((map, result) => {
    map[result.rent_pact_id] = result.vpactnum
    return map
  }, {}))
}

function getUnitDict () {
  return db.units.findAll({
    raw: true,
    attributes: ['unit_id', 'unitname']
  }).then(results => results.reduce((map, result) => {
    map[result.unit_id] = result.unitname
    return map
  }, {}))
}
