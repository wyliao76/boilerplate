const jwt = require('jsonwebtoken')
const asyncSign = require('util').promisify(jwt.sign)
const asyncVerify = require('util').promisify(jwt.verify)
// const Users = require('../models/users')

const checkLogin = async (req, res, next) => {
    if (await verifyToken(req)) {
        return next()
    }
    return res.status(401).json({ message: 'not logged in.' })
}

async function verifyToken(request) {
    const token = request.header('token')
    if (!token) return false
    try {
        const decoded = await asyncVerify(token, process.env.SECRET)
        // request.user = await Users.findOne({ email: decoded.email }).select(['_id', 'email', 'enable', 'token']).lean()
        // return Users.countDocuments({ email: decoded.email, token: token }) // update time stamp
    } catch (error) {
        console.error(error.message)
        return false
    }
}


module.exports = {
    checkLogin,
    asyncSign,
    asyncVerify,
}

