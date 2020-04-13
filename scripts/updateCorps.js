/* global SERVICES_PATH, MODELS_PATH */

'use strict'
require('../config/initializers/global_paths')
require('dotenv-json')({ path: 'env.local.json' })
const docClient = require(`${SERVICES_PATH}/docClient`)
const db = require(`${MODELS_PATH}/index`)

async function main () {
  console.log('Scanning dev.Corp table...')
  const params = {
    TableName: 'dev.Corp'
  }
  let data
  const results = []
  do {
    data = await docClient.scan(params).promise()
    // console.log(data)
    data.Items.forEach((item) => results.push(item))
    params.ExclusiveStartKey = data.LastEvaluatedKey
  } while (typeof data.LastEvaluatedKey !== 'undefined')
  for (const result of results) {
    result.ts = convertDatetime(result.ts)
    result.created_at = new Date()
    result.updated_at = new Date()
    console.log(result)
    const data = await db.corps.update(result, { where: { pk_corp: result.pk_corp } })
    console.log(data)
  }
}

function convertDatetime (dateString) {
  const reggie = /(\d{4})-(\d{2})-(\d{2})(\d{2}):(\d{2}):(\d{2})/
  const [, year, month, day, hours, minutes, seconds] = reggie.exec(dateString)
  return new Date(year, month - 1, day, hours, minutes, seconds)
}

main()
