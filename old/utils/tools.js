const _ = require('lodash')

function flatten(arr) {
    return arr.reduce(function(flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
    }, [])
}

function getPages(req) {
    return {
        per_page: parseInt(req.queryString.per_page, 10),
        page: parseInt(req.queryString.page, 10),
    }
}

function get_time(duration) {
    const milliseconds = parseInt((duration % 1000) / 100)
    let seconds = Math.floor((duration / 1000) % 60)
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds

    return (hours + ':' + minutes + ':' + seconds + '.' + milliseconds)
}

const reducer = (accumulator, currentValue) => Number(accumulator) + Number(currentValue)

const currency_format = (amount) => parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')

const date_format = (string) => {
    const array = string.split('-')
    const year = array[0] ? `${array[0]}年` : ''
    const month = array[1] ? `${array[1]}月` : ''
    const date = array[2] ? `${array[2]}日` : ''
    return `${year}${month}${date}`
}

const getPreviousData = (params, instance) => {
    return Object.keys(params).reduce((map, key) => {
        map[key] = instance[key]
        return map
    }, {})
}

const isPasswordExpire = (passwordLastUpdated, days = 180) => {
    const now = new Date()
    const lastUpdated = new Date(passwordLastUpdated)
    const msInDay = 1000 * 60 * 60 * 24

    return ((now - lastUpdated) / msInDay) >= days
}

function getKeys(ungrouped_rev_fares) {
    return _.uniqWith(ungrouped_rev_fares.map((result) => {
        return {
            rent_pact_id: result.rent_pact_id,
            drevfaredate: result.drevfaredate,
        }
    }), _.isEqual)
}

function getSumDict(keys, ungrouped_rev_fares) {
    const sumDict = {}
    for (const key of keys) {
        let sum = 0.00
        for (const ungrouped_rev_fare of ungrouped_rev_fares) {
            // console.log(key)
            if (ungrouped_rev_fare.drevfaredate === key.drevfaredate && ungrouped_rev_fare.rent_pact_id === key.rent_pact_id) {
                // console.log('before', sum)
                sum += ungrouped_rev_fare.srnrevmny
                // console.log('after', sum)
            }
            sumDict[`${key.drevfaredate}-${key.rent_pact_id}`] = Number(sum.toFixed(2))
        }
    }
    return sumDict
}

module.exports = {
    flatten,
    getPages,
    get_time,
    reducer,
    currency_format,
    date_format,
    getPreviousData,
    isPasswordExpire,
    getKeys,
    getSumDict,
}
