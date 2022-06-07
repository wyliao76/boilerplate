require('dotenv-json')({ path: `env.${process.env.ENV_JSON}.json` })
const AWS = require('aws-sdk')
AWS.config.update({
    region: process.env.AWS_POOL_REGION,
})
const cloudwatchevents = new AWS.CloudWatchEvents()
const lambda = new AWS.Lambda()
const ruleName = 'example'
const lambdaName = 'example'
const user = 'user'
const statementId = 'get_customers'
const state = 'ENABLED'
// const state = 'DISABLED'

async function index() {
    const params = {}
    cloudwatchevents.listRules(params).promise()
        .then((data) => console.log(data))
        .catch((err) => console.log(err, err.stack))
}

async function put() {
    const params = {
        Name: ruleName,
        Description: 'Fetch customers as SA every minute starting at 10:00 AM and ending at 10:59 AM, every day.',
        // EventBusName: 'STRING_VALUE',
        // EventPattern: 'STRING_VALUE',
        // RoleArn: 'arn:aws:events:ap-southeast-1:905931487106:rule/get_customers',
        ScheduleExpression: 'cron(* 02 * * ? *)', // 'rate(1 minute)',
        State: state,
        Tags: [
            {
                Key: 'fetch',
                Value: 'customers',
            },
        ],
    }
    const result = await cloudwatchevents.putRule(params).promise()
    console.log(result)
    return result
}

async function addLambdaPermission(resource) {
    const params = {
        Action: 'lambda:InvokeFunction',
        FunctionName: lambdaName,
        Principal: 'events.amazonaws.com',
        SourceArn: resource.RuleArn,
        StatementId: statementId,
    }
    const result = await lambda.addPermission(params).promise()
    console.log(result)
}

async function putTarget() {
    const input = {
        queryString: {
        },
    }
    const params = {
        Rule: ruleName,
        Targets: [{
            Id: '1',
            Arn: `arn:aws:lambda:${user}:function:${lambdaName}`,
            Input: JSON.stringify(input),
        }],
    }
    const result = await cloudwatchevents.putTargets(params).promise()
    console.log(result)
}

async function removeTarget() {
    const params = {
        Ids: ['1'],
        Rule: ruleName,
        Force: true,
    }
    const result = await cloudwatchevents.removeTargets(params).promise()
    console.log(result)
}

async function removePermission() {
    const params = {
        FunctionName: lambdaName,
        StatementId: statementId,
    }
    const result = await lambda.removePermission(params).promise()
    console.log(result)
}

async function deleteRule() {
    const params = {
        Name: ruleName,
        Force: true,
    }
    const result = await cloudwatchevents.deleteRule(params).promise()
    console.log(result)
}

async function create() {
    try {
        const resource = await put()
        await addLambdaPermission(resource)
        await putTarget()
        return console.log('Rule created!')
    } catch (err) {
        console.log(err)
    }
}

async function destroy() {
    await removeTarget()
    await removePermission()
    await deleteRule()
    return console.log('Rule deleted!')
}

function migrate() {
    const args = process.argv.slice(2)

    switch (args[0]) {
    case 'up':
        create()
        break
    case 'down':
        destroy()
        break
    default:
        console.log('Missing args, pass \'up\' or \'down\'')
    }
}

// main
migrate()
