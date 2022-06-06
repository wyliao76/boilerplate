/* global MODELS_PATH */

require('../config/initializers/global_paths')
require('dotenv-json')({ path: 'env.local.json' })
const fs = require('fs')
const csv = require('fast-csv')
const path = require('path')
const db = require(`${MODELS_PATH}/index`)
const Billbs = db.billbs

function main() {
    const pacts = []
    let now
    fs.createReadStream(path.join(__dirname, '/billbs_view.csv'))
        .pipe(csv.parse({ headers: true }))
        .on('error', (error) => console.error(error))
        .on('data', (row) => {
            // console.log(row)
            const object = {
                billb_id: row.billb_id,
                rent_pact_id: `${row.pk_corp}-${row.pk_pact}`,
                faretype_id: `${row.pk_corp}-${row.pk_faretypeid}`,
                pk_unit: row.pk_unit,
                pk_bill: row.pk_bill,
                pk_billb: row.pk_billb,
                rank: row.rank === 'NULL' ? null : row.rank,
                pk_pact: row.pk_pact,
                pk_faretypeid: row.pk_faretypeid,
                pk_actym: row.pk_actym,
                fisnpay: row.fisnpay,
                nnotaxmny: row.nnotaxmny,
                ntax: row.ntax,
                ntaxrate: row.ntaxrate,
                nybqys: row.nybqys,
                periodandvmemo: row.periodandvmemo,
                ncurreading: row.ncurreading,
                nlastreading: row.nlastreading,
                source: row.source === 'NULL' ? null : row.source,
                ts: row.ts,
                dr: row.dr,
                pk_corp: row.pk_corp,
                created_at: new Date(),
                updated_at: new Date(),
            }
            pacts.push(object)
        })
        .on('end', async (rowCount) => {
            const number = 1000
            let requests = []
            for (const pact of pacts) {
                requests.push(pact)
                if (requests.length === number) {
                    console.log(`${requests.length}`)
                    await Billbs.bulkCreate(requests)
                    now = new Date()
                    console.log(`${now}: ${requests.length} Billbs executed!`)
                    requests = []
                }
            }
            await Billbs.bulkCreate(requests)
            now = new Date()
            console.log(`${now}: ${requests.length} Billbs executed!`)
            console.log(`Parsed ${rowCount} rows`)
            console.log('Done!')
        })
}

module.exports = {
    main,
}
