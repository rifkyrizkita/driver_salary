const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('VariableConfigs', {
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'variable_configs',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "variable_configs_pkey",
        unique: true,
        fields: [
          { name: "key" },
        ]
      },
    ]
  });
};
