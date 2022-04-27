import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

export const category = db.define('category',{
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    type:{
        type:DataTypes.STRING,
        allowNull:false
    },
    src:{
        type:DataTypes.STRING,
        allowNull:false
    }
});

export const field = db.define('field',{
    name:{
        type:DataTypes.STRING,
        allowNull: false
    },
    price:{
        type:DataTypes.STRING,
        allowNull: false
    },
    description:{
        type:DataTypes.TEXT
    },
    address:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    map:{
        type:DataTypes.STRING,
        allowNull:false
    },
});

export const facility = db.define('facility',{
    name:{
        type:DataTypes.STRING,
        allowNull: false
    },
    type:{
        type:DataTypes.STRING,
        allowNull: false
    },
    src:{
        type: DataTypes.STRING,
        allowNull: false
    }
});

export const facility_field = db.define('facility_field',{
});

export const schedule = db.define('schedule',{
    day:{
        type: DataTypes.STRING,
        allowNull: false
    },
    open:{
        type:DataTypes.TIME,
        allowNull: false
    },
    close:{
        type:DataTypes.TIME,
        allowNull: false
    },
});

export const image = db.define('image',{
    type:{
        type: DataTypes.STRING,
        allowNull: false
    },
    source:{
        type:DataTypes.STRING,
        allowNull: false
    },
});

export const review = db.define('review',{
    value:{
        type:DataTypes.INTEGER,
        allowNull: false
    },
    rate:{
        type:DataTypes.FLOAT
    },
    message:{
        type: DataTypes.TEXT,
        allowNull: false,
    }
});

export const province = db.define('province',{
    name:{
        type:DataTypes.STRING,
        allowNull: false
    }
},{
    timestamps:false
})

export const city = db.define('city',{
    name:{
        type:DataTypes.STRING,
        allowNull: false
    }
},{
    timestamps:false
})

export const fieldChooser = db.define('field_chooser',{
    name:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    timestamps:false
})