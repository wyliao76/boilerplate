const { promisify } = require('util')
const request = require('request')

// a way to promisify dependencies

const requestGet = promisify(request.get).bind(request)
const requestPost = promisify(request.post).bind(request)
const requestPut = promisify(request.put).bind(request)
const requestDelete = promisify(request.delete).bind(request)

module.exports = {
    get: requestGet,
    post: requestPost,
    put: requestPut,
    delete: requestDelete,
}
