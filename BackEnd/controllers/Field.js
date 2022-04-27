import {
    field,
    schedule,
    image,
    facility_field,
    facility,
    province,
    category,
    city,
    fieldChooser
} from '../models/FieldModel.js';
import {orderDate, orderField, orderTime} from '../models/OrderModel.js'
import { favorite, Users } from '../models/UserModel.js';
import {nanoid} from 'nanoid/async'
import path from "path";
import {Op, Sequelize} from "sequelize";
const CLIENT_URL = "http://localhost:3000/";
const SERVER_URL = "http://localhost:5000/";

export const addField = async(req, res) =>{
    console.log(JSON.parse(req.body.schedules))
    const {
        id,
        name,
        labels,
        category,
        price,
        desc,
        province,
        city,
        address,
        map,
        profile,
        background,
        schedules,
        facility
    } = req.body;
    try {
        await field.create({
            name: name,
            price: price,
            description: desc,
            address: address,
            map: map,
            user_id: id,
            category_id: category,
            province_id: province,
            city_id:city

        }).then(async(data) =>{
            const field = data.toJSON();
            const reqSchedule = JSON.parse(schedules)
                .map(sch=>{
                    return{
                        ...sch,
                        field_id:field.id
                    }
                });
            try{
                await schedule.bulkCreate(reqSchedule);
            }catch(e){
                console.log(e);
                res.status(400).json({ 
                    "status": 'error',
                    "message": 'Gagal menyimpan Jadwal' 
                });
            }

            // file upload
            if (req.files === undefined ) {
                res.status(400).json({ 
                    "status": 'error',
                    "message": 'Tidak Ada File yang diUnggah' 
                });
            }
            const files = req.files.picture;
            const reqlabel = JSON.parse(labels);
            for (const [idx, file] of files.entries()) {
                upload(
                    file, ()=>{
                    res.status(400).json({ 
                        "status": 'error',
                        "message": 'Jenis file tidak diizinkan' 
                    });
                    }, (size)=>{
                        res.status(400).json({ 
                            "status": 'error',
                            "message": `Ukuran file ${size/1000000}Mb lebih yang diizinkan`
                        });
                    }, (err)=>{
                        res.status(500).json({ 
                            "status": 'error',
                            "message": err
                        });
                    }
                ).then(async (src) => {
                    if(src){
                        let type = '';
                        if(idx === parseInt(profile)){
                            type ='profile'
                        }else if(idx === parseInt(background)){
                            type='background';
                        }else{
                            type='preview'
                        }
                        await image.create({
                            type:type,
                            source:src,
                            field_id:field.id
                        }).then(async(sch)=>{
                            const label = reqlabel.find(lab=>lab.id===idx);
                            if(label){
                                delete label.id;
                                label.img_id = sch.id;
                                label.field_id = field.id;
                                await fieldChooser.create(label);
                            }
                        });
                    }
                })
            }

            // facility

            if(facility.length > 1){
                const reqFacility = facility.map(faci=>{
                    return {
                        field_id:field.id,
                        facility_id:faci,
                    }
                })
                await facility_field.bulkCreate(reqFacility);
            }else{
                await facility_field.create({
                    field_id:field.id,
                    facility_id:facility,
                });
            }
        });
        res.json({message: "Peyewaan Lapang Telah dibuat"});
    } catch (error) {
        console.log(error);
    }
}

const upload = async(file, inEx, inSize, fail, onSuccess) =>{
    const splitFileName = file.name.split('.');
    const typefile = file.mimetype;
    const extention = splitFileName[splitFileName.length -1];
    if((!['PNG','JPEG','JPG'].includes(extention.toUpperCase())) && (!typefile.includes('image/'))){
        inEx();
    }
    const size = file.size;
    if(size>1000000){
        inSize(size);
    }

    // Upload file
    const fileName = await nanoid();
    const __dirname = path.resolve();
    file.mv(`${__dirname}/images/${fileName}.${extention}`, err => {
        if (err) {
            fail(err)
        }
    });
    return`${SERVER_URL}images/${fileName}.${extention}`;
}

export const getField = async(req, res) => {
    try{
        const fields = await field.findOne({
            where:{
                id:req.params.id
            },
            attributes:{exclude:['user_id', 'province_id', 'city_id', 'category_id', 'createdAt', 'updatedAt']},
            order:[[fieldChooser,'name', 'ASC']],
            include:[{
                model: image,
                required: true,
                attributes:{exclude:['field_id', 'createdAt', 'updatedAt']}
            },
            {
                model:schedule,
                required: true,
                attributes:{exclude:['field_id', 'createdAt', 'updatedAt']}
            },
            {
                model:facility_field,
                required:true,
                attributes:['id'],
                include:[{
                    model:facility,
                    attributes:{exclude:['id', 'createdAt', 'updatedAt']}
                }]
            },
            {
                model: Users,
                required: true,
                attributes:['id','avatar','firstName','lastName']
            },
            {
                model: fieldChooser,
                required: true,
                attributes:['id', 'name'],
                include:[{
                    model:image,
                    required: true,
                    attributes:['source'],
                }]
            }
            ],
        })
        
        res.json(fields);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const getlistField = async(req, res) =>{
    try{
        const fields = await field.findAll({
            attributes:['id', 'name', 'price'],
            include:[{
                model: city,
                required: true,
                attributes:['name']
            },{
                model: image,
                required: true,
                where:{
                    type:"profile"
                },
                attributes:['source']
            }
            ],
        })
        
        res.json(fields);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const fieldFinder = async(req, res) =>{
    try{
        const categorySelected = await category.findOne({
            where:{
                name:req.body.category
            }
        })
        const queryCategory = (categorySelected) ? {
            where:{
                id:categorySelected.toJSON().id
            }
        } : {};
        const fields = await field.findAll({
            where:Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('field.name')), 'LIKE', `%${req.body.keyword.toLowerCase()}%`),
            attributes:['id', 'name', 'price'],
            include:[{
                model: city,
                required: true,
                attributes:['name']
            },{
                model: image,
                required: true,
                where:{
                    type:"profile"
                },
                attributes:['source']
            },{
                model: category,
                required:true,
                ...queryCategory
            }
            ]
        });
        res.json(fields);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const getCategories = async(req, res) =>{
    try{
        const categories = await category.findAll({
            attributes:['id', 'name'],
        })
        
        res.json(categories);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const setCategories = async(req, res) =>{
    const id = (Array.isArray(req.body.id))? req.body.id : [req.body.id];
    try{
        const categories = await field.findAll({
            where:{
                category_id:{
                    [Op.or]:id
                }
            },
            attributes:['id', 'name', 'price', 'updatedAt'],
            include:[{
                model: city,
                required: true,
                attributes:['name']
            },{
                model: image,
                required: true,
                where:{
                    type:"profile"
                },
                attributes:['source']
            }
            ],
        })
        
        res.json(categories);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const getCity = async(req, res) =>{
    try{
        const cities = await city.findAll({
            limit:15
        })
        res.json(cities);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const filterCity = async(req, res) =>{
    const fProvince = (req.body.id)? {province_id:req.body.id}: {};
    try{
        const cities = await city.findAll({
            limit:15,
            where:{
                name:{
                    [Op.like]:`%${req.body.city.toUpperCase()}%`
                },
                ...fProvince
            }
        })
        res.json(cities);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const getProvince = async(req, res) =>{
    try{
        const provinces = await province.findAll({
            limit:15
        })
        res.json(provinces);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const filterProvince = async(req, res) =>{
    try{
        const provinces = await province.findAll({
            limit:15,
            where:{
                name:{
                    [Op.like]:`%${req.body.province.toUpperCase()}%`
                }
            }
        })
        res.json(provinces);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const setLocal = async(req, res) =>{
    const setProvince = (req.params.province!=0) ? {province_id:parseInt(req.params.province)} : {};
    const setCity = (req.params.city!=0) ? {city_id:parseInt(req.params.city)} : {};
    try{
        const categories = await field.findAll({
            where:{
                ...setProvince,
                ...setCity
            },
            attributes:['id', 'name', 'price', 'updatedAt'],
            include:[{
                model: city,
                required: true,
                attributes:['name']
            },{
                model: image,
                required: true,
                where:{
                    type:"profile"
                },
                attributes:['source']
            }
            ],
        })
        
        res.json(categories);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const setPrice = async(req, res) =>{
    const min = req.body.min;
    const max = req.body.max;
    const filterMin = (min&& min>0) ? {[Op.gte]: min}:{};
    const filterMax = (max&& max>0) ? {[Op.lte]: max}:{};
    try{
        const categories = await field.findAll({
            where:{
                price:{
                    ...filterMin,
                    ...filterMax
                }
            },
            attributes:['id', 'name', 'price', 'updatedAt'],
            include:[{
                model: city,
                required: true,
                attributes:['name']
            },{
                model: image,
                required: true,
                where:{
                    type:"profile"
                },
                attributes:['source']
            }
            ],
        })
        
        res.json(categories);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const listFavorite = async(req, res)=>{
    try{
        const fields = await favorite.findAll({
            where:{
                user_id:req.body.idUser
            },
            attributes:['id'],
            include:{
                model:field,
                required:true,
                attributes:['id', 'name', 'price'],
                include:[{
                    model: city,
                    required: true,
                    attributes:['name']
                },{
                    model: image,
                    required: true,
                    where:{
                        type:"profile"
                    },
                    attributes:['source']
                }
                ],
            }
        })
        
        res.json(fields);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}

export const favoriteFinder = async(req, res)=>{
    try{
        console.log(req.body);
        const fields = await favorite.findAll({
            where:{
                user_id:req.body.idUser
            },
            attributes:['id'],
            include:{
                model:field,
                required:true,
                where:Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('field.name')), 'LIKE', `%${req.body.keyword.toLowerCase()}%`),
                attributes:['id', 'name', 'price'],
                include:[{
                    model: city,
                    required: true,
                    attributes:['name']
                },{
                    model: image,
                    required: true,
                    where:{
                        type:"profile"
                    },
                    attributes:['source']
                }
                ],
            }
        })
        
        res.json(fields);
    }catch(err) {
        return res.status(400).json({ 
            "status": 'error',
            "message": err.message
        });
    }
}