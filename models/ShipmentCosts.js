const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ShipmentCosts', {
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
      unique: "unique_shipment_costs"
    },
    shipment_no: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'shipments',
        key: 'shipment_no'
      },
      unique: "unique_shipment_costs"
    },
    total_costs: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    cost_status: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'shipment_costs',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "shipment_costs_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "unique_shipment_costs",
        unique: true,
        fields: [
          { name: "driver_code" },
          { name: "shipment_no" },
        ]
      },
    ]
  });
};
