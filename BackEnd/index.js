import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cookieSession from 'cookie-session';
import cors from "cors";
import path from "path";
import db from "./config/Database.js";
import setRouter from "./routes/index.js";
import './passport.js'
import passport from 'passport';
import {
  field,
  facility,
  facility_field,
  schedule,
  image,
  review,
  category,
  province,
  city,
  fieldChooser
} from './models/FieldModel.js';
import {
  Users,
  favorite,
  fromChat,
  toChat,
  chat,
  inbox,
} from './models/UserModel.js';
import fileUpload from 'express-fileupload';
import { orderDate, orderField, orderSelected, orderTime } from "./models/OrderModel.js";
import { createServer } from 'http';
import { Server } from 'socket.io';
import { payment, paymentMethode, topUp } from "./models/PaymentModel.js";

dotenv.config();
const app = express();

app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);
app.use(passport.initialize());
app.use(passport.session());
try {
    await db.authenticate();
    console.log('Database Connected...');
    const option = (fieldName) =>({ foreignKey:{name:fieldName,allowNull:false}, onDelete: 'CASCADE', onUpdate: 'CASCADE'});
    
    Users.hasMany(field, option('user_id'));
    field.belongsTo(Users, option('user_id'));
    
    category.hasMany(field, option('category_id'));
    field.belongsTo(category, option('category_id'));

    field.hasMany(facility_field, option('field_id'));
    facility_field.belongsTo(field, option('field_id'));

    facility.hasMany(facility_field, option('facility_id'));
    facility_field.belongsTo(facility, option('facility_id'));

    field.hasMany(schedule, option('field_id'));
    schedule.belongsTo(field, option('field_id'));

    field.hasMany(image, option('field_id'));
    image.belongsTo(field, option('field_id'));

    Users.hasMany(review, option('user_id'));
    review.belongsTo(Users, option('user_id'));
    
    field.hasMany(review, option('field_id'));
    review.belongsTo(field, option('field_id'));

    Users.hasMany(favorite, option('user_id'));
    favorite.belongsTo(Users, option('user_id'));

    field.hasMany(favorite, option('field_id'));
    favorite.belongsTo(field, option('field_id'));

    province.hasMany(field, option('province_id'));
    field.belongsTo(province, option('province_id'));

    city.hasMany(field, option('city_id'));
    field.belongsTo(city, option('city_id'));

    province.hasMany(city, option('province_id'));
    city.belongsTo(province, option('province_id'));

    field.hasMany(fieldChooser, option('field_id'));
    fieldChooser.belongsTo(field, option('field_id'));

    image.hasMany(fieldChooser, option('img_id'));
    fieldChooser.belongsTo(image, option('img_id'));

    Users.hasMany(payment, option('user_id'));
    payment.belongsTo(Users, option('user_id'));

    Users.hasOne(fromChat, option('user_id'));
    fromChat.belongsTo(Users, option('user_id'));

    Users.hasOne(toChat, option('user_id'));
    toChat.belongsTo(Users, option('user_id'));

    Users.hasMany(chat, option('from'));
    chat.belongsTo(Users, option('from'));

    Users.hasMany(inbox, option('toread'));
    inbox.belongsTo(Users, option('toread'));

    fromChat.hasMany(inbox, option('from'));
    inbox.belongsTo(fromChat, option('from'));

    toChat.hasMany(inbox, option('to'));
    inbox.belongsTo(toChat, option('to'));

    inbox.hasMany(chat, option('inbox_id'));
    chat.belongsTo(inbox, option('inbox_id'));

    field.hasMany(orderTime, option('field_id'));
    orderTime.belongsTo(field, option('field_id'));

    Users.hasMany(orderTime, option('user_id'));
    orderTime.belongsTo(Users, option('user_id'));

    payment.hasOne(orderSelected, option('payment_id'));
    orderSelected.belongsTo(payment, option('payment_id'));

    orderTime.hasMany(orderSelected, option('time_id'));
    orderSelected.belongsTo(orderTime, option('time_id'));

    orderTime.hasMany(orderDate, option('time_id'));
    orderDate.belongsTo(orderTime, option('time_id'));
    
    orderTime.hasMany(orderField, option('time_id'));
    orderField.belongsTo(orderTime, option('time_id'));

    fieldChooser.hasMany(orderField, option('fieldChooser_id'));
    orderField.belongsTo(fieldChooser, option('fieldChooser_id'));

    paymentMethode.hasMany(payment, option('method_id'));
    payment.belongsTo(paymentMethode, option('method_id'));
    
    paymentMethode.hasMany(topUp, option('user_id'));
    topUp.belongsTo(paymentMethode, option('user_id'));

    // Create table sync(), Edit table sync({alter:true}), Delete table name.includes(_test) db.drop({match: /_test$/})
    // await category.sync();
    // await Users.sync({alter:true});
    // await field.sync();
    // await facility.sync();
    // await facility_field.sync();
    // await schedule.sync({alter:true});
    // await image.sync();
    // await review.sync();
    // await favorite.sync();
    // await paymentMethode.sync({alter:true});
    await topUp.sync({alter:true});
    // await payment.sync({alter:true});
    // await orderDate.sync({alter:true});
    // await orderTime.sync({alter:true});
    // await orderField.sync({alter:true});
    // await fromChat.sync();
    // await toChat.sync();
    // await inbox.sync({alter:true});
    // await chat.sync({alter:true});
    // await fieldChooser.sync({alter:true});
    // await province.sync({alter:true});
    // await city.sync({alter:true});
    // await payment.sync();
    // await orderSelected.sync({alter:true});
} catch (error) {
    console.error(error);
}
const __dirname = path.resolve();
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(cors({ credentials:true, origin:'http://localhost:3000' }));
app.use(cookieParser());
app.use(express.json());
app.use(fileUpload());


const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin:'http://localhost:3000' } });
app.use(setRouter(io));
app.set('port', 5000);
// app.listen(5000, ()=> console.log('Server running at port 5000'));
httpServer.listen(app.get('port'), ()=> console.log('Server running at port 5000'));