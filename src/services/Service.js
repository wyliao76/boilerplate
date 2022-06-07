class Service {
    static rejectResponse(error, code = 500) {
        console.log(error)
        return { error, code }
    }

    static successResponse(payload, code = 200) {
        return { payload, code }
    }
}

module.exports = Service
