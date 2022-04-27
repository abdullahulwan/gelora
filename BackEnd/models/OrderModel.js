import { nanoid } from "nanoid/async";
import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

export const orderSelected = db.define('order_selected',{},{
    timestamps:false
})

export const orderDate = db.define('order_date',{
    date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
},{
    timestamps:false
})

export const orderTime = db.define('order_Time',{
    payStatus:{
        type: DataTypes.STRING,
        defaultValue:'Payment Process',
        allowNull: false,
    },
    start:{
        type:DataTypes.TIME,
        allowNull: false
    },
    end:{
        type:DataTypes.TIME,
        allowNull: false
    }
},{
    timestamps:false
})

export const orderField = db.define('order_Field',{},{
    timestamps:false
})