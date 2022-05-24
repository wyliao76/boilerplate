const util = require('util')
const exec = util.promisify(require('child_process').exec)

const REGION = 'ap-southeast-1'

const getSsmParameter = async (name) => {
    const command =
        `aws ssm get-parameter --region=ap-southeast-1 --name ${name} --query Parameter.Value --output text`
    const { stdout } = await exec(command)
    return stdout.trim()
}

const describeAsg = async (asgName) => {
    const command =
        `aws autoscaling describe-auto-scaling-groups --region ${REGION} --auto-scaling-group-names ${asgName} --query "AutoScalingGroups[0].Instances[0].InstanceId" --output text`
    const { stdout } = await exec(command)
    return stdout.trim()
}

const getBastionId = async () => {
    const name = ''
    const asgName = await getSsmParameter(name)
    const instanceId = await describeAsg(asgName)
    return instanceId
}

const getDbEndPoint = async () => {
    const address = await getSsmParameter('')
    const port = await getSsmParameter('')
    return `${address}:${port}`
}

const getMqEndPoint = async () => {
    const address = await getSsmParameter('')
    const port = await getSsmParameter('')
    return `${address}:${port}`
}

const getMqWebEndPoint = async () => {
    const address = await getSsmParameter('')
    const port = 443
    return `${address}:${port}`
}

const main = async () => {
    const localDb = '5558'
    const localMq = '5559'
    const localMqWeb = '127.0.0.1:5443'
    const localRedis = '5444'

    const [bastionId, remoteDb, remoteMq, remoteMqWeb, remoteRedis] = await Promise.all([
        getBastionId(),
        getDbEndPoint(),
        getMqEndPoint(),
        getMqWebEndPoint(),
        'redis:6379',
    ])

    const command = `ssh -fNg -L ${localDb}:${remoteDb} -L ${localMq}:${remoteMq} -L ${localMqWeb}:${remoteMqWeb} -L ${localRedis}:${remoteRedis} ec2-user@${bastionId}--${REGION}`
    console.log(command)
}

main()
