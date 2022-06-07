const { promisify } = require('util')
const redis = require('redis')

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
})

client.on('connect', function() {
    console.log('Redis client connected')
})

client.on('error', function(err) {
    console.log('Something went wrong ' + err)
})

const clientSet = promisify(client.set).bind(client)
const clientSetex = promisify(client.setex).bind(client)
const clientGet = promisify(client.get).bind(client)
const clientDel = promisify(client.del).bind(client)
const clientQuit = promisify(client.quit).bind(client)

module.exports = {
    set: clientSet,
    setex: clientSetex,
    get: clientGet,
    del: clientDel,
    quit: clientQuit,
}
