const Service = require('./Service')

const healthGET = () => {
    try {
        const result = {
            ts: Date.now(),
        }
        return Service.successResponse(result)
    } catch (e) {
        return Service.rejectResponse(e)
    }
}

module.exports = {
    healthGET,
}
