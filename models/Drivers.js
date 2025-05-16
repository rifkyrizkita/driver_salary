const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Drivers', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    driver_code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "drivers_driver_code_key"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'drivers',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "drivers_driver_code_key",
        unique: true,
        fields: [
          { name: "driver_code" },
        ]
      },
      {
        name: "drivers_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
