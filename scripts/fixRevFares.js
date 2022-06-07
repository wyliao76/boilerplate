require('../config/initializers/global_paths')
require('dotenv-json')({ path: `env.${process.env.ENV_JSON}.json` })
const db = require('../app/models/index')
const Op = require('sequelize').Op

async function main() {
    console.log(new Date())
    const hrstart = process.hrtime()

    const total = await db.rev_fares.count({
        where: {
            [Op.or]: {
                faretype_id: null,
                customer_id: null,
            },
        },
    })
    console.log('total: ', total)
    const size = 1000
    const times = Math.ceil(total / size)
    console.log('times: ', times)
    let revFares; let dictFaretype; let dictCustomer; let results
    for (let i = 0; i < times; i++) {
        revFares = await findAndUpdate(size, i)
        dictFaretype = revFares.reduce((map, revFare) => {
            map[revFare.id] = revFare.pk_faretypeid ? `${revFare.site}-${revFare.pk_faretypeid}` : ''
            return map
        }, {})

        dictCustomer = revFares.reduce((map, revFare) => {
            map[revFare.id] = revFare.pk_lessee ? `${revFare.site}-${revFare.pk_lessee}` : ''
            return map
        }, {})

        // console.log('dictFaretype: ', dictFaretype)
        // console.log('dictCustomer: ', dictCustomer)

        results = (await Promise.all(
            Object.keys(dictFaretype).map((key) => {
                return db.rev_fares.update({
                    faretype_id: dictFaretype[key],
                    customer_id: dictCustomer[key],
                },
                { where: { id: key } })
            }),
        ))
            .flat()
            .reduce((a, b) => Number(a) + Number(b), 0)
        console.log(results)

        const hrend = process.hrtime(hrstart)
        console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    }
}

function findAndUpdate(size, i) {
    return db.rev_fares.findAll({
        raw: true,
        attributes: ['id', 'pk_faretypeid', 'pk_lessee', 'site'],
        limit: size,
        offset: size * i,
        where: {
            [Op.or]: {
                faretype_id: null,
                customer_id: null,
            },
        },
    })
}

main()
