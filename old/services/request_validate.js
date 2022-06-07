const validate = require('validate.js')

validate.validators.optional = (value, options) => {
    return !['', null, undefined].includes(value) ? validate.single(value, options) : null
}

exports.validate = (body, schema) => {
    const result = validate(body, schema)

    if (typeof result === 'undefined') {
        return { status: true, result: {} }
    } else {
        return { status: false, result: result }
    }
}
