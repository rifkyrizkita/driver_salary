const { Op, fn, literal, where } = require("sequelize");
const {
  Drivers,
  ShipmentCosts,
  Shipments,
  DriverAttendances,
  VariableConfigs,
} = require("../models");

const pad = (n) => String(n).padStart(2, "0");

exports.getDriverSalaries = async (req, res) => {
  try {
    const month = +req.query.month;
    const year = +req.query.year;
    if (!month || !year) {
      return res.status(400).json({
        error: "Month and year parameters are required.",
      });
    }

    const current = +req.query.current || 1;
    const page_size = +req.query.page_size || 10;
    const offset = (current - 1) * page_size;
    const name = req.query.name || null;
    const driver_code = req.query.driver_code || null;
    const validStatuses = ["PENDING", "CONFIRMED", "PAID"];
    const status = req.query.status;
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        error:
          "Invalid status. Allowed values are PENDING, CONFIRMED, PAID or empty.",
      });
    }

    const cfg = await VariableConfigs.findOne({
      where: { key: "DRIVER_MONTHLY_ATTENDANCE_SALARY" },
      attributes: ["value"],
    });
    if (!cfg) {
      return res.status(400).json({
        error: "Config DRIVER_MONTHLY_ATTENDANCE_SALARY not found",
      });
    }
    const attendanceRate = +cfg.value;

    const monthIndex = month - 1;
    const endDateObj = new Date(year, monthIndex + 1, 0);
    const startStr = `${year}-${pad(month)}-01`;
    const endStr = `${year}-${pad(month)}-${pad(endDateObj.getDate())}`;

    const whereDriver = {};
    if (name) {
      whereDriver.name = { [Op.iLike]: `%${name}%` };
    }
    if (driver_code) {
      whereDriver.driver_code = { [Op.iLike]: `%${driver_code}%` };
    }

    let havingCondition = null;
    if (status === "PENDING") {
      havingCondition = where(
        fn(
          "SUM",
          literal(`
            CASE WHEN "shipment_costs"."cost_status" = 'PENDING'
            THEN "shipment_costs"."total_costs" ELSE 0 END
          `)
        ),
        { [Op.gt]: 0 }
      );
    } else if (status === "CONFIRMED") {
      havingCondition = where(
        fn(
          "SUM",
          literal(`
            CASE WHEN "shipment_costs"."cost_status" = 'CONFIRMED'
            THEN "shipment_costs"."total_costs" ELSE 0 END
          `)
        ),
        { [Op.gt]: 0 }
      );
    } else if (status === "PAID") {
      havingCondition = {
        [Op.and]: [
          where(
            fn(
              "SUM",
              literal(`
                CASE WHEN "shipment_costs"."cost_status" = 'PAID'
                THEN "shipment_costs"."total_costs" ELSE 0 END
              `)
            ),
            { [Op.gt]: 0 }
          ),
          where(
            fn(
              "SUM",
              literal(`
                CASE WHEN "shipment_costs"."cost_status" = 'CONFIRMED'
                THEN "shipment_costs"."total_costs" ELSE 0 END
              `)
            ),
            0
          ),
          where(
            fn(
              "SUM",
              literal(`
                CASE WHEN "shipment_costs"."cost_status" = 'PENDING'
                THEN "shipment_costs"."total_costs" ELSE 0 END
              `)
            ),
            0
          ),
        ],
      };
    }

    const totalDrivers = await Drivers.count();

    const rows = await Drivers.findAll({
      where: whereDriver,
      attributes: [
        "driver_code",
        "name",

        [
          fn(
            "SUM",
            literal(`
              CASE WHEN "shipment_costs"."cost_status" = 'PENDING'
              THEN "shipment_costs"."total_costs" ELSE 0 END
            `)
          ),
          "total_pending",
        ],

        [
          fn(
            "SUM",
            literal(`
              CASE WHEN "shipment_costs"."cost_status" = 'CONFIRMED'
              THEN "shipment_costs"."total_costs" ELSE 0 END
            `)
          ),
          "total_confirmed",
        ],

        [
          fn(
            "SUM",
            literal(`
              CASE WHEN "shipment_costs"."cost_status" = 'PAID'
              THEN "shipment_costs"."total_costs" ELSE 0 END
            `)
          ),
          "total_paid",
        ],

        [
          fn(
            "SUM",
            literal(`
              CASE 
              WHEN "driver_attendances"."attendance_status" = TRUE
              AND "driver_attendances"."attendance_date" BETWEEN '${startStr}' AND '${endStr}'
              THEN ${attendanceRate} ELSE 0 END
            `)
          ),
          "total_attendance_salary",
        ],

        [
          fn("COUNT", literal(`DISTINCT "shipment_costs"."shipment_no"`)),
          "count_shipment",
        ],
      ],

      include: [
        {
          model: ShipmentCosts,
          as: "shipment_costs",
          attributes: [],
          required: false,
          include: [
            {
              model: Shipments,
              as: "shipment_no_shipment",
              attributes: [],
              required: true,
              where: {
                shipment_status: { [Op.not]: "CANCELLED" },
                shipment_date: { [Op.between]: [startStr, endStr] },
              },
            },
          ],
        },

        {
          model: DriverAttendances,
          as: "driver_attendances",
          attributes: [],
          required: false,
        },
      ],

      group: ["Drivers.id", "Drivers.driver_code", "Drivers.name"],
      having: havingCondition,
      offset,
      limit: page_size,
      subQuery: false,
    });

    const result = rows.map((row) => {
      const data = row.toJSON();
      const total_pending = +data.total_pending || 0;
      const total_confirmed = +data.total_confirmed || 0;
      const total_paid = +data.total_paid || 0;
      const total_attendance_salary = +data.total_attendance_salary || 0;
      const total_salary =
        total_pending + total_confirmed + total_paid + total_attendance_salary;
      const count_shipment = +data.count_shipment || 0;

      return {
        driver_code: data.driver_code,
        name: data.name,
        total_pending,
        total_confirmed,
        total_paid,
        total_attendance_salary,
        total_salary,
        count_shipment,
      };
    });

    if (rows.length === 0 || current < 0 || current > page_size) {
      return res.status(200).json({
        message: "No data found for the given criteria.",
        data: result,
        total_row: totalDrivers,
        current,
        page_size,
      });
    }
    return res.json({
      data: result,
      total_row: totalDrivers,
      current,
      page_size,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};
