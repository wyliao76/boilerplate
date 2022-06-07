'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await insert(queryInterface)
    },
    down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {})
    */
    },
}

async function insert(queryInterface) {
    const users = [
    ]
    await queryInterface.bulkInsert('users', users, {})
    console.log('users created.')
}
