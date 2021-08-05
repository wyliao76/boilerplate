
const getQuery = (body) => {
    const {
        array1,
        array2,
        array3,
    } = body

    const new1 = array1.map((object) => {
        return Object.entries(object).map(([key, values]) => {
            if (values.length > 0) {
                return {
                    $or: values.map((value) => {
                        return { [`array1.${key}`]: iLike(value) }
                    }),
                }
            } else {
                throw new Error(400, `Values cannot be empty. ${JSON.stringify(object)}`)
            }
        })
    }).flat()

    const new2 = array2.map((object) => {
        return {
            array2: {
                $elemMatch: getElement(object),
            },
        }
    })

    const new3 = array3.map((object) => {
        return {
            array3: {
                $elemMatch: getElement(object),
            },
        }
    })

    const array = [...new1, ...new2, ...new3]
    const filter = {}
    if (array.length > 0) filter.$and = array

    return filter
}

const query = async (body, extra) => {
    const filter = { ...extra, ...getQuery(body) }

    return Model
        .find(filter)
        .lean()
        .then((results) => results.map((result) => result.example))
}

function iLike(str) {
    // eslint-disable-next-line no-useless-escape
    const escaped = str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
    return new RegExp(escaped, 'i')
}

function getElement(object) {
    const { field1, field2 } = object
    const element = {
        field1: iLike(field1),
        field2: field2.map((object) => iLike(object))
    }
    return element
}

// const example = {
//     '$and': [
//       { '$or': [ { 'array1.key1': /yo/i } ] },
//       {
//         array2: {
//           '$elemMatch': {
//             field1: /hey/i,
//             field2: [ /hey2/i ],
//           }
//         }
//       },
//       {
//         array2: {
//           '$elemMatch': {
//             field1: /hey/i,
//             field2: [ /hey2/i ],
//           }
//         }
//       },
//       {
//         array3: {
//           '$elemMatch': {
//             field1: /hey/i,
//             field2: [ /hey2/i ],
//           }
//         }
//       }
//     ],
//   }