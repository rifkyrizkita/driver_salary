const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DriverAttendances', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    driver_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'drivers',
        key: 'driver_code'
      },
      unique: "unique_attendance"
    },
    attendance_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: "unique_attendance"
    },
    attendance_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'driver_attendances',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "driver_attendances_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "unique_attendance",
        unique: true,
        fields: [
          { name: "driver_code" },
          { name: "attendance_date" },
        ]
      },
    ]
  });
};
