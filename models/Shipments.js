const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Shipments', {
    shipment_no: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    shipment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    shipment_status: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'shipments',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "shipments_pkey",
        unique: true,
        fields: [
          { name: "shipment_no" },
        ]
      },
    ]
  });
};
