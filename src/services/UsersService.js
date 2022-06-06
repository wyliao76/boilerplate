const Service = require('./Service')

const usersEmailDELETE = async (params) => {
    try {
        console.log(params)
        const result = {
            ts: Date.now(),
        }
        return Service.successResponse(result)
    } catch (e) {
        return Service.rejectResponse(e)
    }
}

const usersEmailPUT = (params) => {
    try {
        console.log(params)
        const result = {
            ts: Date.now(),
        }
        return Service.successResponse(result)
    } catch (e) {
        return Service.rejectResponse(e)
    }
}

const usersGET = (params) => {
    try {
        return Service.successResponse(params)
    } catch (e) {
        return Service.rejectResponse(e)
    }
}

const usersPOST = (params) => {
    try {
        console.log(params)
        return Service.successResponse(params)
    } catch (e) {
        return Service.rejectResponse(e)
    }
}

module.exports = {
    usersEmailDELETE,
    usersEmailPUT,
    usersGET,
    usersPOST,
}
