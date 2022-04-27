import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

export const Users = db.define('users',{
    avatar:{
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName:{
        type:DataTypes.STRING,
        allowNull: false
    },
    lastName:{
        type:DataTypes.STRING,
        allowNull: false
    },
    username:{
        type:DataTypes.STRING,
        unique:true,
        allowNull: false
    },
    sex:{
        type:DataTypes.STRING,
        allowNull: false
    },
    address:{
        type:DataTypes.TEXT,
        allowNull: false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull: false
    },
    dateOfBirth:{
        type:DataTypes.DATE,
        allowNull: false
    },
    email:{
        type:DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    password:{
        type: DataTypes.STRING
    },
    refresh_token:{
        type: DataTypes.TEXT,
    },
    Saldo:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    id_google:{
        type: DataTypes.STRING,
        allowNull: true
    }
});

export const fromChat = db.define('fromChat',{},{
    timestamps:false
})
export const toChat = db.define('toChat',{},{
    timestamps:false
})
export const inbox = db.define('inbox',{
    message:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    unread:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
},{
})
export const chat = db.define('chat',{
    message:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    read:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
        allowNull:false,
    },
})
export const favorite = db.define('favorite',{
});
