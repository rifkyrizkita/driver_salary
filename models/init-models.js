var DataTypes = require("sequelize").DataTypes;
var _DriverAttendances = require("./DriverAttendances");
var _Drivers = require("./Drivers");
var _ShipmentCosts = require("./ShipmentCosts");
var _Shipments = require("./Shipments");
var _VariableConfigs = require("./VariableConfigs");

function initModels(sequelize) {
  var DriverAttendances = _DriverAttendances(sequelize, DataTypes);
  var Drivers = _Drivers(sequelize, DataTypes);
  var ShipmentCosts = _ShipmentCosts(sequelize, DataTypes);
  var Shipments = _Shipments(sequelize, DataTypes);
  var VariableConfigs = _VariableConfigs(sequelize, DataTypes);

  DriverAttendances.belongsTo(Drivers, {
    as: "driver_code_driver",
    foreignKey: "driver_code",
    targetKey: "driver_code",
  });
  Drivers.hasMany(DriverAttendances, {
    as: "driver_attendances",
    foreignKey: "driver_code",
    sourceKey: "driver_code",
  });

  ShipmentCosts.belongsTo(Drivers, {
    as: "driver_code_driver",
    foreignKey: "driver_code",
    targetKey: "driver_code",
  });
  Drivers.hasMany(ShipmentCosts, {
    as: "shipment_costs",
    foreignKey: "driver_code",
    sourceKey: "driver_code",
  });

  ShipmentCosts.belongsTo(Shipments, {
    as: "shipment_no_shipment",
    foreignKey: "shipment_no",
    targetKey: "shipment_no",
  });
  Shipments.hasMany(ShipmentCosts, {
    as: "shipment_costs",
    foreignKey: "shipment_no",
    sourceKey: "shipment_no",
  });

  return {
    DriverAttendances,
    Drivers,
    ShipmentCosts,
    Shipments,
    VariableConfigs,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
