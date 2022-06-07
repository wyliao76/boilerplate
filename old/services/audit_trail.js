
const AuditTrail = async (model, sequelize, DataTypes, option) => {
    const modelName = option.modelName
    const audit_trails = sequelize.define(
        'audit_trails',
        {
            model: DataTypes.STRING,
            action: DataTypes.STRING,
            target_id: DataTypes.INTEGER,
            user_id: DataTypes.INTEGER,
            role: DataTypes.STRING,
            record_type: DataTypes.STRING,
            previous_data: DataTypes.TEXT,
            metadata: DataTypes.TEXT,
        },
        option,
    )

    const createHook = (instance, options) => {
    // console.log('createHook', instance)
    // console.log('options', options)
        const { user_id = null, role = null } = options.trackOptions || {}

        const object = {
            record_type: getRecordType(modelName),
            model: modelName,
            action: 'create',
            user_id: user_id,
            role: role,
            metadata: JSON.stringify(instance.dataValues) || '',
        }
        // console.log(object)
        return audit_trails.create(object)
    }

    const createBulkHook = (instance, options) => {
    // console.log('createBulkHook', instance)
    // console.log('options', options)
        const { user_id = null, role = null } = options.trackOptions
        const objects = instance.map((data) => {
            return {
                record_type: getRecordType(modelName),
                model: modelName,
                action: 'bulkCreate',
                user_id: user_id,
                role: role,
                metadata: JSON.stringify(data) || '',
            }
        })
        // console.log(objects)
        return audit_trails.bulkCreate(objects)
    }

    const updateHook = (instance) => {
    // console.log('beforUpdate: ', instance)
        const { target_id = null, user_id = null, role = null, previousData = null } = instance.trackOptions || {}
        const object = {
            record_type: getRecordType(modelName),
            model: modelName,
            action: 'update',
            target_id: target_id,
            user_id: Number(user_id),
            role: role,
            previous_data: JSON.stringify(previousData),
            metadata: JSON.stringify(instance.attributes),
        }
        // console.log(object)
        return audit_trails.create(object)
    }

    const updateBulkHook = (instance) => {
    // console.log('beforeBulkUpdate: ', instance)
        const { target_id = null, user_id = null, role = null, previousData = null } = instance.trackOptions || {}
        const previousDataArray = Array.isArray(previousData) ? previousData : [previousData]
        const objects = []
        for (const index in previousDataArray) {
            objects.push({
                record_type: getRecordType(modelName),
                model: modelName,
                action: 'bulkUpdate',
                target_id: String(target_id).split(',')[index],
                user_id: Number(user_id),
                role: role,
                previous_data: JSON.stringify(previousDataArray[index]),
                metadata: JSON.stringify(instance.attributes),
            })
        }
        return audit_trails.bulkCreate(objects)
    }

    const deleteHook = (instance) => {
    // console.log('deleteHook', instance)
        const { target_id = null, user_id = null, role = null, previousData } = instance.trackOptions || {}
        const object = {
            record_type: getRecordType(modelName),
            model: modelName,
            action: 'delete',
            target_id: target_id,
            user_id: Number(user_id),
            role: role,
            previous_data: JSON.stringify(previousData) || null,
        }
        // console.log(object)
        return audit_trails.create(object)
    }

    const deleteBulkHook = (instance) => {
    // console.log('deleteBulkHook', instance)
        const { target_id = null, user_id = null, role = null, previousData } = instance.trackOptions || {}
        const previousDataArray = Array.isArray(previousData) ? previousData : [previousData]
        const objects = []
        for (const index in previousDataArray) {
            objects.push({
                record_type: getRecordType(modelName),
                model: modelName,
                action: 'bulkDelete',
                target_id: String(target_id).split(',')[index],
                user_id: Number(user_id),
                role: role,
                previous_data: JSON.stringify(previousDataArray[index]) || null,
            })
        }
        return audit_trails.bulkCreate(objects)
    }

    model.addHook('afterCreate', createHook)
    model.addHook('afterBulkCreate', createBulkHook)
    model.addHook('beforeUpdate', updateHook)
    model.addHook('beforeBulkUpdate', updateBulkHook)
    model.addHook('beforeDestroy', deleteHook)
    model.addHook('beforeBulkDestroy', deleteBulkHook)
}

const getRecordType = (modelName) => {
    switch (modelName) {
    case 'admins':
        return 'admin'
    case 'admin_groups':
    case 'admin_groups_customers':
        return 'admin_group'
    case 'paperless_records':
        return 'paperless'
    case 'tenants':
    case 'tenant_rent_pacts':
        return 'tenant'
    case 'tenant_users':
    case 'tenant_user_invites':
    case 'tenant_user_units':
        return 'tenant_user'
    default:
        return ''
    }
}

module.exports = AuditTrail

