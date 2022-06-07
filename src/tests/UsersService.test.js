// const usersService = require('../services/UsersService')
const { expect } = require('expect')
const usersModel = require('../models/users')

const users = [
    {
        email: 'wyliao76@gmail.com',
    },
]
const request = {
    body: {
        email: users[0].email,
    },
}
// let's do TDD yo
const usersPOST = async (request) => {
    const { email } = request.body
    if (!email) throw new Error('missing email address.')
    const result = await usersModel.create({
        email,
    })
    return result
}

describe('users service', () => {
    describe('users POST', () => {
        it('should post', async () => {
            const result = await usersPOST(request)
            expect(result.email).toBe(users[0].email)
            // const { code, payload: file } = await usersService.usersPOST(request)
            // expect(code).toBe(200)
            // expect(file.email).toBe(users[0].email)
        })

        it('should throw an error (bad request)', async () => {
            await expect(usersPOST({ body: {} })).rejects.toThrow('missing email address.')
        })
    })
})
