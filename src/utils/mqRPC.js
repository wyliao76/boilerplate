const mqUtils = require('./mqUtils')
const { v4: uuidV4 } = require('uuid')

const promiseLookup = {}
const rpcId = uuidV4()

const rpcSubscribe = async (options) => {
    options.callback = rpcCallbackWrapper
    mqUtils.subscribe(options)
}

const rpcPublish = (publishOptions, replyTo) => {
    return new Promise((resolve, reject) => {
        const correlationId = uuidV4()
        const timeOut = setTimeout(() => {
            delete promiseLookup[correlationId]
            reject(new Error('timeout!'))
        }, 3000)
        promiseLookup[correlationId] = (msg) => rpcCallback(resolve, reject, msg, timeOut, correlationId)
        publishOptions.msgConfig = { correlationId: correlationId, replyTo: replyTo }
        mqUtils.publish(publishOptions)
    })
}

function rpcCallbackWrapper(msg) {
    const { properties: { correlationId } = {} } = msg
    return promiseLookup[correlationId] && promiseLookup[correlationId](msg)
}
const rpcCallback = (resolve, reject, msg, timeOut, correlationId) => {
    clearTimeout(timeOut)
    delete promiseLookup[correlationId]

    const result = JSON.parse(msg.content.toString())
    if (result.error) {
        return reject(new Error(result.code, result.error))
    }
    return resolve(result)
}
module.exports = {
    rpcId,
    rpcSubscribe,
    rpcPublish,
    rpcCallback,
}

