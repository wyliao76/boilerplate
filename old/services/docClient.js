const AWS = require('aws-sdk')
AWS.config.update({
    region: process.env.AWS_DYNAMODB_REGION,
})
const docClient = new AWS.DynamoDB.DocumentClient()

module.exports = docClient

// use by seeder
