require('dotenv').config({ path: `${__dirname}/config/.env.${process.env.NODE_ENV}` })

const mongoose = require('mongoose')
const { server, app } = require('./expressServer')
const mqUtils = require('../src/utils/mqUtils')

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    pass: process.env.DATABASE_PASSWORD,
    useCreateIndex: true,
    useFindAndModify: false,
    ssl: process.env.NODE_ENV === 'local' ? false : true,
    poolSize: 50,
    // sslValidate: false,
}

const launch = async () => {
    try {
        const mqUrl = process.env.MQ_HOST.replace('://', `://${process.env.MQ_USERNAME}:${encodeURIComponent(process.env.MQ_PASSWORD)}@`)
        const mongoUrl = `mongodb://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`
        await Promise.all([
            process.env.MODE !== 'NO_SUBSCRIBE' ? mqUtils.connect(mqUrl) : null,
            mongoose.connect(mongoUrl, mongoOptions),
        ])
        console.log('MongoDB connect successful.')
        // NOTE: To avoid the following error on AWS ECS
        // TypeError: process.send is not a function
        //     at launch(/var/src / index.js: 33: 17)
        //     at processTicksAndRejections(internal / process / task_queues.js: 93: 5)
        // process.send('ready')

        server.listen(process.env.PORT, () => {
            const { address, port } = server.address()
            console.log('app listening at http://%s:%s', address, port)
            console.log(`TL is working now on ${app.get('env')}. (pid: ${process.pid})`)
        })
    } catch (err) {
        console.log(err)
        console.log('MongoDB or MQ connection failed')
        process.exit(1)
    }
}

async function mongoDBShutdown() {
    await mongoose.connection.close(false)
    console.log('MongoDb connection closed.')
}

process.on('SIGINT', () => {
    console.log('SIGINT signal received.')
    console.log('Closing http server...')
    server.close(async (err) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
        console.log('Http server closed.')
        try {
            await Promise.all([
                process.env.MODE !== 'NO_SUBSCRIBE' ? mqUtils.shutdown() : null,
                mongoDBShutdown(),
            ])
            process.exit(0)
        } catch (err) {
            console.error(err)
            process.exit(1)
        }
    })
})

process.on('uncaughtException', function(err) {
    console.log(err)
})

launch()
