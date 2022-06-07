// const usersService = require('../services/UsersService')
const usersModel = require('../models/users')
const { expect } = require('expect')

const users = [
    {
        email: 'wyliao76@gmail.com',
    },
]

describe('users service', () => {
    it('should post', async () => {
        // let's do TDD yo
        const usersPOST = async () => {
            const { email } = request.body
            if (!email) throw new Error('missing email address.')
            const result = await usersModel.create({
                email,
            })
            return result
        }
        const request = {
            body: {
                email: users[0].email,
            },
        }
        const result = await usersPOST(request)
        expect(result.email).toBe(users[0].email)
        // const { code, payload: file } = await usersService.usersPOST(request)
        // expect(code).toBe(200)
        // expect(file.email).toBe(users[0].email)
    })
})
