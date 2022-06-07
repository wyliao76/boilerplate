const usersService = require('../services/UsersService')
const { expect } = require('expect')

const users = [
    {
        email: 'wyliao76@gmail.com',
    },
]

describe('users service', () => {
    describe('users POST', () => {
        it('should post', async () => {
            const request = {
                body: {
                    email: users[0].email,
                },
            }
            const { code, payload: file } = await usersService.usersPOST(request)
            expect(code).toBe(200)
            expect(file.email).toBe(users[0].email)
        })

        it('should throw an error (bad request)', async () => {
            const emptyRequest = { body: {} }
            const { code, error } = await usersService.usersPOST(emptyRequest)
            expect(code).toBe(400)
            expect(error).toBe('missing email address.')
        })
    })
})
