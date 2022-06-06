const amqp = require('amqp-connection-manager')
const Deferred = require('promise-deferred')

let mqClient
let channel
let connected = false
const subscribeOptions = []

const connect = async (url) => {
    console.log('MQ is connecting...')
    const connectDeferred = new Deferred()
    mqClient = await amqp.connect(url)

    mqClient.on('connect', () => {
        connected = true

        mqClient.createChannel({
            setup: (chan) => {
                channel = chan
                subscribeOptions.map((options) => subscribeImpl(options))
                connectDeferred.resolve()
                console.log('[MQ] channel created')
            },
        })

        console.log('[MQ] connected')
    })

    mqClient.on('disconnect', (data) => {
        connected = false
        console.error('[MQ] disconnected', data)
    })

    mqClient.on('error', (data) => {
        console.error('[MQ] error', data)
    })

    mqClient.on('close', () => {
        console.log('[MQ] closed')
    })

    return connectDeferred.promise
}

const isConnected = () => {
    return connected
}

const publishToQueue = async (options) => {
    const {
        queue,
        msg,
        msgConfig = {},
    } = options
    channel.sendToQueue(queue, Buffer.from(msg), msgConfig)
}

const publish = async (options) => {
    const {
        exchange,
        pattern,
        routingKey,
        msg,
        config = {
            durable: true, // Defaults to true, may be omitted
        },
        msgConfig = {},
    } = options

    await channel.assertExchange(exchange, pattern, config)
    channel.publish(exchange, routingKey, Buffer.from(msg), msgConfig)
    return {
        pattern: pattern,
        exchange: exchange,
        routingKey,
        config,
        msg,
        timestamp: new Date().getTime(),
    }
}

const subscribe = async (options) => {
    subscribeOptions.push(options)
    if (connected) {
        await subscribeImpl(options)
    }
}

const subscribeImpl = async (options) => {
    const {
        exchange,
        pattern,
        bindingKey,
        queue,
        callback = defaultCallback,
        exchangeConfig = {
            durable: true, // Defaults to true, may be omitted
            autoDelete: false, // Defaults to false, may be omitted
        },
        queueConfig = {
            durable: true, // Defaults to true, may be omitted
            autoDelete: false, // Defaults to false, may be omitted
        },
        consumeConfig = {
            noAck: true, // Defaults to true, means auto ack
        },
    } = options

    await channel.assertExchange(exchange, pattern, exchangeConfig)
    const q = await channel.assertQueue(queue, queueConfig)
    console.log(q)
    await channel.bindQueue(q.queue, exchange, bindingKey)
    channel.consume(q.queue, callback, consumeConfig)
    return {
        pattern: pattern,
        exchange: exchange,
        queue: queue,
        bindingKey: bindingKey,
        exchangeConfig,
        queueConfig,
        consumeConfig,
        timestamp: new Date().getTime(),
    }
}

const ackChannel = (msg) => {
    return channel.ack(msg) // promise
}

const shutdown = async () => {
    console.log('MQ is closing...')
    await channel.close()
    console.log('MQ channel closed.')
    await mqClient.close()
    console.log('MQ Client connection closed.')
}

const deleteQueue = (options) => {
    const {
        queue,
        config = {
            ifUnused: false, // Defaults to false, may be omitted
            ifEmpty: false, // Defaults to false, may be omitted
        },
    } = options
    return channel.deleteQueue(queue, config)
}

function defaultCallback(msg) {
    console.log(' [x] %s:\'%s\'', msg.fields.routingKey, msg.content.toString())
}

module.exports = {
    connect,
    isConnected,
    publish,
    publishToQueue,
    subscribe,
    deleteQueue,
    ackChannel,
    shutdown,
}

