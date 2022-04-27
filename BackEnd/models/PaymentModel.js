import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

export const payment = db.define('payment',{
    code:{
        type: DataTypes.STRING,
        allowNull:false
    },
    price:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    expire:{
        type: DataTypes.DATE,
        allowNull: true,
    }
});

export const topUp = db.define('topUp',{
    balanceIncrease:{
        type:DataTypes.STRING,
        allowNull:false,
    }
});

export const paymentMethode = db.define('payment_methode',{
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    expire:{
        type:DataTypes.DATE,
        allowNull:true,
    },
    url:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    status:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    source_type:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    source:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    step:{
        type:DataTypes.TEXT,
        allowNull:true,
    },
});