require('dotenv-json')({ path: `env.${process.env.ENV_JSON}.json` })
const AWS = require('aws-sdk')

// create a SQS
async function main() {
    const sqs = new AWS.SQS({
        region: process.env.AWS_SNS_REGION,
    })
    const params = {
        QueueName: `SQS_pdf_generator_bill-${process.env.ENV_JSON}`,
        Attributes: {
            VisibilityTimeout: 180, // cannot be less than lambda's timeout
        },
    }
    try {
        const results = await sqs.createQueue(params).promise()
        console.log(results)
        return results
    } catch (err) {
        console.log(err)
    }
}

main()

// grant AmazonSQSFullAccess to user lambda-deployment for AWS cli deployment
// grant AWSLambdaSQSQueueExecutionRole Lambda's role => LambdaCognitoAuthRole

// mapping cmd
// aws lambda create-event-source-mapping --function-name hanglung-claudia-pdf-local  --batch-size 10 \
// --event-source-arn arn:aws:sqs:ap-southeast-1:905931487106:SQS_pdf_generator_bill-local

// request
// for loop => array of 10 objects
// put { "bill_type": "bill", "bill_id": "GG-1001A2100000001D0RU2" } in body
// {
//     "Records": [
//         {
//             "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
//             "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
//             "body": "Test message.",
//             "attributes": {
//                 "ApproximateReceiveCount": "1",
//                 "SentTimestamp": "1545082649183",
//                 "SenderId": "AIDAIENQZJOLO23YVJ4VO",
//                 "ApproximateFirstReceiveTimestamp": "1545082649185"
//             },
//             "messageAttributes": {},
//             "md5OfBody": "e4e68fb7bd0e697a0ae8f1bb342846b3",
//             "eventSource": "aws:sqs",
//             "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
//             "awsRegion": "us-east-2"
//         },
//         {
//             "messageId": "2e1424d4-f796-459a-8184-9c92662be6da",
//             "receiptHandle": "AQEBzWwaftRI0KuVm4tP+/7q1rGgNqicHq...",
//             "body": "Test message.",
//             "attributes": {
//                 "ApproximateReceiveCount": "1",
//                 "SentTimestamp": "1545082650636",
//                 "SenderId": "AIDAIENQZJOLO23YVJ4VO",
//                 "ApproximateFirstReceiveTimestamp": "1545082650649"
//             },
//             "messageAttributes": {},
//             "md5OfBody": "e4e68fb7bd0e697a0ae8f1bb342846b3",
//             "eventSource": "aws:sqs",
//             "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
//             "awsRegion": "us-east-2"
//         }
//     ]
// }
