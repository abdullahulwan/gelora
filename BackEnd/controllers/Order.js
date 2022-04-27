import {
    field,
    image,
    fieldChooser,
    schedule
} from '../models/FieldModel.js';
import {Op, Sequelize} from "sequelize";
import moment from 'moment';
import { orderDate, orderField, orderSelected, orderTime } from '../models/OrderModel.js';
import {nanoid} from 'nanoid/async'
import { Users } from '../models/UserModel.js';
import { payment, paymentMethode } from '../models/PaymentModel.js';
const CLIENT_URL = "http://localhost:3000/";
const SERVER_URL = "http://localhost:5000/";

export const addNewOrder = async(req, res) => {
    const {idUser, idField, data} = req.body;
    const orders = JSON.parse(data);

    try {
        const fieldSelected = await field.findOne({
            where:{
                id:idField
            },
            attributes:['id'],
            include:[{
                model:fieldChooser,
                required:true,
                attributes:['id']
            }]
        });
        if(fieldSelected){
            const {field_choosers} = fieldSelected.toJSON();
            const checkField = orders.every(item=>{
                return item.field.every(selectedId =>{
                    return field_choosers.some(cho=>cho.id === selectedId)
                })
            })

            if(checkField){
                const time = orders.map(item =>{
                    return{
                        start:item.start,
                        end:item.end,
                        payStatus:"Payment Process",
                        user_id:idUser,
                        field_id:idField,
                    }
                });
                const createdTime = await orderTime.bulkCreate(time,{returning:true});
                const idTimes = createdTime.map(itemTime=>itemTime.toJSON().id);
                const dates = [];
                orders.forEach((item,idx) =>{
                    item.date.forEach(date=>{
                        dates.push({
                            date:date,
                            time_id:idTimes[idx],
                        })
                    })
                });
                await orderDate.bulkCreate(dates,{returning:true});
                const setOrderField = [];
                orders.forEach((item,idx)=>{
                    item.field.forEach(fieldItem=>{
                        setOrderField.push({
                            fieldChooser_id:fieldItem,
                            time_id:idTimes[idx],
                        })
                    });
                });
                await orderField.bulkCreate(setOrderField);
                res.json({ 
                    "state": 'sucess',
                    "message": "Berhasil Dibuat"
                });
            }else{
                return res.status(400).json({ 
                    "state": 'error',
                    "message": "Nomor Lapang terpilih tidak Ditemukan"
                });
            }
        }else{
            return res.status(400).json({ 
                "state": 'error',
                "message": "Lapang terpilih tidak Ditemukan"
            });
        }
    } catch (error) {
        return res.status(400).json({ 
            "state": 'error',
            // "message": 'Terjadi Masalah dengan Database'
            "message": error.message
        });
    }
}

const getTime = (rawTime) =>{
    const [hours, minutes] = rawTime.split(':');
    const setTime = new Date();
    setTime.setHours(parseInt(hours,10));
    setTime.setMinutes(parseInt(minutes, 10));
    return setTime.getTime();
}

const diffMinutes = (a,b)=>{
    const diffTime = Math.abs(getTime(a) - getTime(b));
    return Math.ceil(diffTime / (1000 * 60));
}

export const getScheduleById = async(req, res) =>{
    try{
        const getSchedules = await orderDate.findAll({
            where:{
                field_id:req.params.id
            },
            attributes:['date'],
            include:[
                {
                    model:orderTime,
                    required: true,
                    attributes:['start', 'end'],
                    include:[
                        {
                            model:orderField,
                            required: true,
                            attributes:['fieldChooser_id'],
                        },
                    ]
                },
            ]
        })
        const schedulesResult = [];
        getSchedules.forEach(sch=>{
            const data = sch.toJSON();
            let idx;
            if(!(schedulesResult.filter(e=>e.date === data.date).length> 0)){
                idx = schedulesResult.length;
                schedulesResult.push({
                    date:data.date,
                });
                schedulesResult[idx].time = [];
            }else{
                idx = schedulesResult.findIndex(e=>e.date === data.date);
            }
            data.order_Times.forEach(time=>{
                const idxTime = schedulesResult[idx].time.length;
                schedulesResult[idx].time.push({start:time.start, end:time.end});
                if(!schedulesResult[idx].time[idxTime].field){
                    schedulesResult[idx].time[idxTime].field = [];
                }
                time.order_Fields.forEach(fieldId=>{
                    const idxField = schedulesResult[idx].time[idxTime].field.indexOf(fieldId);
                    if(idxField<0){
                        schedulesResult[idx].time[idxTime].field.push(fieldId.fieldChooser_id)
                    }
                })
            })
        })

        res.json(schedulesResult);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const getOrder = async(req, res) =>{
    try{
        const orders = await orderTime.findAll({
            where:{
                user_id:req.body.iduser,
                payStatus:'Payment Process'
            },
            attributes:['id', 'start', 'end'],
            include:[
                {
                    model:field,
                    attributes:['id','name', 'price'],
                    required:true,
                    include:[{
                        model:image,
                        required:true,
                        attributes:['type', 'source']
                    }]
                },
                {
                    model:orderDate,
                    attributes:['date'],
                    required:true,
                },
                {
                    model:orderField,
                    attributes:['fieldChooser_id'],
                    required:true,
                    include:[{
                        model:fieldChooser,
                        required:true,
                        attributes:['name']
                    }]
                }
            ]
        })
        const orders_field = [];
        orders.forEach(item=>{
            const data = item.toJSON();
            let idxField  = orders_field.findIndex(dataField=>dataField.fieldId === data.field.id);
            if(idxField<0){
                idxField = orders_field.length;
                orders_field.push({fieldId:data.field.id, fieldName:data.field.name, price:data.field.price, image:data.field.images.find(img=>img.type === "profile").source});
                orders_field[idxField].order = [];
            }

            if(!(idxField<0)){
                const date = data.order_dates.map(dateItem=>moment(dateItem.date, "YYYY-MM-DD").format("DD/MM/YYYY"));
                const fieldOrder = data.order_Fields.map(fieldItem=>{return{id:fieldItem.fieldChooser_id, name:fieldItem.field_chooser.name}});
                const duration = diffMinutes(data.end, data.start);
                orders_field[idxField].order.push(
                    {
                        id:data.id,
                        date:date,
                        start:data.start,
                        end:data.end,
                        duration:duration,
                        price_total:parseInt(data.field.price)*fieldOrder.length*date.length*(duration/60),
                        fields:fieldOrder,
                    })
            }
        })
        res.json(orders_field);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const deleteOrder = async(req, res)=>{
    const {idField, idUser} = req.body;
    try{
        await orderTime.destroy({
            where:{
                field_id:idField,
                user_id:idUser,
                payStatus:'Payment Process'
            }
        })
        res.json({ 
            "state": 'sucess',
            "message": "Berhasil Dihapus"
        });
    }catch(e){
         return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const editOrder = async(req, res)=>{
    const {idUser, idField, data} = req.body;
    const orders = JSON.parse(data);
    try{
        const fieldSelected = await field.findOne({
            where:{
                id:idField
            },
            attributes:['id'],
            include:[{
                model:fieldChooser,
                required:true,
                attributes:['id']
            }]
        });
        if(fieldSelected){
            const {field_choosers} = fieldSelected.toJSON();
            const checkField = orders.every(item=>{
                return item.field.every(selectedId =>{
                    return field_choosers.some(cho=>cho.id === selectedId)
                })
            })

            if(checkField){
                await orderTime.destroy({
                    where:{
                        field_id:idField,
                        user_id:idUser,
                        payStatus:'Payment Process'
                    }
                })
                const time = orders.map(item =>{
                    return{
                        start:item.start,
                        end:item.end,
                        payStatus:"Payment Process",
                        user_id:idUser,
                        field_id:idField,
                    }
                });
                const createdTime = await orderTime.bulkCreate(time,{returning:true});
                const idTimes = createdTime.map(itemTime=>itemTime.toJSON().id);
                const dates = [];
                orders.forEach((item,idx) =>{
                    item.date.forEach(date=>{
                        dates.push({
                            date:date,
                            time_id:idTimes[idx],
                        })
                    })
                });
                await orderDate.bulkCreate(dates,{returning:true});
                const setOrderField = [];
                orders.forEach((item,idx)=>{
                        item.field.forEach(fieldItem=>{
                            setOrderField.push({
                            fieldChooser_id:fieldItem,
                            time_id:idTimes[idx],
                        })
                    });
                })
                await orderField.bulkCreate(setOrderField);
                res.json({ 
                    "state": 'sucess',
                    "message": "Berhasil Dibuat"
                });
            }else{
                return res.status(400).json({ 
                    "state": 'error',
                    "message": "Nomor Lapang terpilih tidak Ditemukan"
                });
            }
        }else{
            return res.status(400).json({ 
                "state": 'error',
                "message": "Lapang terpilih tidak Ditemukan"
            });
        }
    }catch(e){
         return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}
const random = ()=>{
    let text = "";
    const possible = "0123456789";

    for (var i = 0; i < 20; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
export const paymentOrder = async(req, res)=>{
    const {id, method, user} = req.body;
    const idTimes = (Array.isArray(id))? {[Op.or]:id}: id;
    try{
        const orderData = await orderTime.findAll({
            where:{
                id:idTimes
            },
            attributes:['start', 'end', ],
            include:[{
                model:field,
                required:true,
                attributes:['price'],
                include:{
                    model: Users,
                    required:true,
                    attributes:['id', 'Saldo']
                }
            },
            {
                model:orderDate,
                required:true,
            },
            {
                model:orderField,
                required:true
            }
            ]
        });
        const price = orderData.map(selectedField=>{
            const data = selectedField.toJSON();
            return{
                idOwner:data.field.user.id,
                addPrice:parseInt(data.field.price)*data.order_dates.length*data.order_Fields.length*diffMinutes(data.end, data.start)/60
            }
        })
        const total = price.reduce((tot,{addPrice})=>{
            return tot+addPrice
        },0);
        let error = false;
        const dataUser = await Users.findOne({
            where:{
                id:user
            },
            attributes:['Saldo', 'phone']
        })
        const {Saldo, phone} = dataUser.toJSON();
        const selectedMethod = await paymentMethode.findOne({where:{id:method}});
        const selectedPayMethod = selectedMethod.toJSON();
        const statusPay = selectedPayMethod.status;
        if(selectedPayMethod.name==="Saldo"){
            const change = Saldo - total;
            if(change>=0){
                    await Users.update({Saldo:change},{
                    where:{
                        id:user
                    }
                })
                price.forEach(async(dataChage)=>{
                    await Users.increment('Saldo',{by:dataChage.addPrice, where:{id:dataChage.idOwner},logging:true})
                })
            }else{
                error = true;
                return res.status(400).json({ 
                    "state": 'error',
                    "message": "saldo tidak cukup"
                });
            }
        }
        if(!error){
            const code = phone;
            const method_expire = new Date(selectedPayMethod.expire);
            const expire = new Date();
            expire.setHours(expire.getHours()+method_expire.getHours());
            expire.setMinutes(expire.getMinutes()+method_expire.getMinutes());
            expire.setSeconds(expire.getSeconds()+method_expire.getSeconds());
            const dataPayment = await payment.create({code:code, method_id:method, expire:expire, price:total, user_id:user});
            const idPayment = dataPayment.toJSON().id;
            if(Array.isArray(id)){
                await orderSelected.bulkCreate(id.map(order=>{return{payment_id:idPayment, time_id:order}}));
            }else{
                await orderSelected.create({payment_id:idPayment, time_id:id});
            }
            await orderTime.update({payStatus:statusPay},{
                where:{
                    id:idTimes
                }
            })
            res.json({ id:idPayment, status:"ada" });
        }
    }catch(e){
        console.log(e);
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const getRemaining = async(req, res)=>{
    const {id, user} = req.body
    try{
        const remaining = await payment.findOne({
            where:{
                id:id,
                user_id:user
            },
            attributes:['id','price', 'code', 'expire'],
            include:[{
                model:paymentMethode,
                required:true
            }]
        });
        res.json(remaining);
    }catch(e){
        console.log(e.message)
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const detailOrder = async(req, res)=>{
    try{
        const dataOrders = await payment.findOne({
            where:{
                id:req.body.id
            },
            attributes:['price'],
            include:[{
                model:orderSelected,
                required:true,
                attributes:['id'],
                include:[{
                    model:orderTime,
                    required:true,
                    attributes:['start', 'end'],
                    include:[
                    {
                        model:field,
                        required:true,
                        attributes:['id','price', 'name'],
                    },
                    {
                        model:orderDate,
                        required:true,
                        attributes:['date'],
                    },
                    {
                        model:orderField,
                        required:true,
                        attributes:['id'],
                        include:{
                            model:fieldChooser,
                            required:true,
                            attributes:['name'],
                        }
                    }]
                }]
            }]
        })
        if(dataOrders){
            const orders = dataOrders.toJSON();
            const orders_field = [];
            const orderSelected = (orders.order_selected) ? [orders.order_selected] : orders.order_selecteds;
            orderSelected.forEach(item=>{
                let idxField  = orders_field.findIndex(dataField=>dataField.fieldId === item.order_Time.field.id);
                if(idxField<0){
                    idxField = orders_field.length;
                    orders_field.push({fieldId:item.order_Time.field.id, fieldName:item.order_Time.field.name, price:item.order_Time.field.price});
                    orders_field[idxField].order = [];
                }
    
                if(!(idxField<0)){
                    const date = item.order_Time.order_dates.map(dateItem=>moment(dateItem.date, "YYYY-MM-DD").format("DD/MM/YYYY"));
                    const fieldOrder = item.order_Time.order_Fields.map(fieldItem=>{return{id:fieldItem.fieldChooser_id, name:fieldItem.field_chooser.name}});
                    const duration = diffMinutes(item.order_Time.end, item.order_Time.start);
                    orders_field[idxField].order.push(
                        {
                            id:item.order_Time.id,
                            date:date,
                            start:item.order_Time.start,
                            end:item.order_Time.end,
                            duration:duration,
                            fields:fieldOrder,
                        })
                }
            })
            res.json({total:orders.price,detail:orders_field});
        }else{
            return res.status(400).json({ 
                "state": 'error',
                "message": "Order Tidak di temukan"
            });
        }
    }catch(e){
        console.log(e);
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const orderList = async(req, res)=>{
    try{
        const orders = await payment.findAll({
            where:{
                user_id:req.body.id
            },
            order:[['createdAt','DESC']],
            attributes:{exclude:['updatedAt', 'user_id']},
            include:[{
                model:paymentMethode,
                required:true
            }]
        })
        res.json(orders);
    }catch(e){
        console.log(e);
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const orderPendingList = async(req, res)=>{
    try{
        const orders = await payment.findAll({
            where:{
                user_id:req.body.id,
                expire:{
                    [Op.gte]: moment().toDate()
                }
            },
            order:[['createdAt','DESC']],
            attributes:{exclude:['updatedAt', 'user_id']},
            include:[{
                model:paymentMethode,
                required:true,
            }]
        })
        res.json(orders);
    }catch(e){
        console.log(e);
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const orderDelete = async(req, res)=>{
    try{
        const orders = await payment.destroy({
            where:{
                id:req.body.id
            }
        });
        res.json({"message": "Riwayat pesanan telah di hapus"});
    }catch(e){
        console.log(e);
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const listOrderFields = async(req, res) =>{
    try{
        const data = await field.findAll({
            where:{
                user_id:req.body.id
            },
            attributes:['name'],
            include:[{
                model:orderTime,
                required:true,
                // where:{
                //     payStatus:"Paid Off"
                // },
                attributes:['start', 'end'],
                include:[{
                    model:orderDate,
                    required:true,
                    where:{
                        date:{[Op.gte]:new Date()}
                    },
                    order:['date'],
                    attributes:{exclude:['time_id']},
                },{
                    model:orderField,
                    required:true,
                    attributes:['fieldChooser_id'],
                    include:[{
                        model:fieldChooser,
                        require:true,
                        attributes:['name'],
                    }]
                },{
                    model:Users,
                    required:true,
                    attributes:['firstName','lastName']
                }]
            }]
        });
        res.json(data);
    }catch(e){
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const allTransaction = async(req, res) =>{
    try{
        const data = await field.findAll({
            where:{
                user_id:req.body.id
            },
            attributes:['name'],
            include:[{
                model:orderTime,
                required:true,
                where:{
                    payStatus:{[Op.not]:"Payment Pending"}
                },
                attributes:['start', 'end', 'payStatus'],
                include:[{
                    model:orderDate,
                    required:true,
                    order:['date'],
                    attributes:{exclude:['time_id']},
                },{
                    model:orderField,
                    required:true,
                    attributes:['fieldChooser_id'],
                    include:[{
                        model:fieldChooser,
                        require:true,
                        attributes:['name'],
                    }]
                },{
                    model:Users,
                    required:true,
                    attributes:['firstName','lastName']
                }]
            }]
        });
        res.json(data);
    }catch(e){
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const fieldList = async(req, res) =>{
    try{
        const data = await field.findAll({
            where:{
                user_id:req.body.id
            },
            include:[{
                model:image,
                required:true,
            },{
                model:fieldChooser,
                require:true,
            }]
        });
        res.json(data);
    }catch(e){
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}