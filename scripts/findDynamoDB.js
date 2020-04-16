const AWS = require('aws-sdk')
require('dotenv-json')({ path: 'env.test.json' })
AWS.config.update({
  region: process.env.AWS_DYNAMODB_REGION
})
// const dynamoDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' }) // regular API
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' }) // abstract away type in params

async function main () {
  const tableName = 'sample'
  const titleValues = [
        'example'
    ]
  const titleObject = {}
  let index = 0
  titleValues.forEach(value => {
    index++
    const titleKey = ':billb_id' + index
    titleObject[titleKey.toString()] = value
  })

  const params = {
    TableName: tableName,
    FilterExpression: 'billb_id IN (' + Object.keys(titleObject).toString() + ')',
    ExpressionAttributeValues: titleObject
  }
  // console.log(params)
  console.log(`Scanning table ${tableName}...`)
  let data
  // let requests = []
  const results = []
  do {
    data = await docClient.scan(params).promise()
    // console.log(data)
    data.Items.forEach((item) => results.push(item))
    params.ExclusiveStartKey = data.LastEvaluatedKey
  } while (typeof data.LastEvaluatedKey !== 'undefined')
  console.log(results)
}

main()
