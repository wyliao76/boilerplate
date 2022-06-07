'use strict'
module.exports = (sequelize, DataTypes) => {
    const audit_trails = sequelize.define(
        'audit_trails',
        {
            model: DataTypes.STRING,
            action: DataTypes.STRING,
            target_id: DataTypes.STRING,
            user_id: DataTypes.INTEGER,
            role: DataTypes.STRING,
            record_type: DataTypes.STRING,
            previous_data: DataTypes.TEXT,
            metadata: DataTypes.TEXT,
        },
        {
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    )
    audit_trails.associate = (models) => {
    // associations can be defined here
    }
    return audit_trails
}
