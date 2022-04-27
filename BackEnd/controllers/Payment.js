import { Op, Sequelize } from "sequelize";
import { paymentMethode } from "../models/PaymentModel.js";
import { Users } from "../models/UserModel.js";

export const getmethodPayment = async(req, res)=>{
    try {
        const data = await paymentMethode.findAll();
        res.json(data)
    } catch (error) {
        return res.status(400).json({ 
            "state": 'error',
            "message": error.message
        });
    }
}

export const saldo = async(req, res)=>{
    try {
        const data = await Users.findOne({
            where:{
                id:req.body.id
            },
            attributes:['Saldo']
        });
        res.json(data);
    } catch (error) {
        return res.status(400).json({ 
            "state": 'error',
            "message": error.message
        });
    }
}