/* global SERVICES_PATH */

require('../../config/global_paths')
const utilities = require(`${SERVICES_PATH}/utilities`)

async function main() {
    try {
        const hrstart = process.hrtime()

        console.log(utilities)

        const hrend = process.hrtime(hrstart)
        console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    } catch (err) {
        console.log(err)
    }
}

main()
