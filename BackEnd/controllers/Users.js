import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    chat,
    favorite,
    fromChat,
    inbox,
    toChat,
    Users
} from '../models/UserModel.js';
import {Op} from "sequelize";
import {nanoid} from 'nanoid/async'
import path from "path";
import { RECEIVE_MESSAGE, SEEN_MESSAGE } from "../SocketConfig.js";
const SERVER_URL = "http://localhost:5000/";

export const getUser = async(req, res) => {
    try{
        const user = await Users.findOne({
            where:{
                id: req.body.id
            },
            order: [ [ 'createdAt', 'DESC' ]]
        })
        res.json(user);
    }catch(error){
        console.log(error);
    }
}

export const updateUser = async(req, res) => {
    const {request} = req.body;
    let data = {};
    switch (request) {
        case "avatar":
            if (req.files === undefined ) {
                return res.status(400).json({ 
                    "status": 'error',
                    "message": 'Tidak Ada File yang diUnggah' 
                });
            }
            if (req.files.avatar.length){
                return res.status(400).json({ 
                    "status": 'error',
                    "message": 'hanya satu File yang diizinkan' 
                });
            }
            const splitFileName = req.files.avatar.name.split('.');
            const typefile = req.files.avatar.mimetype;
            const extention = splitFileName[splitFileName.length -1];
            if((!['PNG','JPEG','JPG'].includes(extention.toUpperCase())) && (!typefile.includes('image/'))){
                return res.status(400).json({ 
                    "status": 'error',
                    "message": 'Jenis file tidak diizinkan' 
                });
            }
            const size = req.files.avatar.size;
            if(size>1000000){
                return res.status(400).json({ 
                    "status": 'error',
                    "message": `Ukuran file ${size/1000000}Mb lebih yang diizinkan`
                });
            }

            // Upload file
            const fileName = await nanoid();
            const __dirname = path.resolve();
            const file = req.files.avatar;
            file.mv(`${__dirname}/images/${fileName}.${extention}`, err => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ 
                        "status": 'error',
                        "message": err
                    });
                }
            });
            data = { avatar: `${SERVER_URL}images/${fileName}.${extention}` };
            break;
        case "name":
            data = {
                firstName: req.body.firstName,
                lastName: req.body.lastName
            };
            break;
        case "sex":
            data = { sex: req.body.sex };
            break;
        case "address":
            data = { address: req.body.address };
            break;
        case "phone":
            data = { phone: req.body.phone };
            break;
        case "dateofbirth":
            data = { dateOfBirth: req.body.dateOfBirth };
            break;
        case "username":
            data = { username: req.body.username };
            break;
        case "email":
            data = { email: req.body.email };
            break;
        case "owner":
            data = { owner: req.body.owner };
            break;
        case "password":
            if(req.body.password === req.body.confirm){
                data = {
                    password: req.body.password,
                    confirm: req.body.confirm
                }
            }else{
                res.json({ 
                    "status": 'error',
                    "message": "Password dan konfirmasi password tidak sama"
                });
            }
            break;
        default:
            res.json({ 
                "status": 'error',
                "message": "Gagal Mengubah"
            });
            break;
    }
    if(Object.keys(data).length > 0){
        res.json({
                    "status": 'success',
                    "message": "user updated"
                })
        await Users.update(data, {
            where: {
                    id: req.body.id
                }
            }).then(()=>{
                res.json({
                    "status": 'success',
                    "message": "user updated"
                })
            }).catch(error =>{
                res.json({ 
                    "status": 'error',
                    "message": (request === "username" || request === "Email") ? `${request} Sudah Terpakai` : error.message
                });
            });
    }
}

export const Register = (addUser) =>{
    return async(req, res) => {
        const {
            firstName,
            lastName,
            username,
            sex,
            address,
            phone,
            dateOfBirth,
            email,
            password,
            confPassword,
            agreement,
            idGoogle,
            avatar,
            idSocket
        } = req.body;
        if(password !== confPassword) return res.status(400).json({message: "Password dan Confirm Password tidak cocok"});
        if(!agreement) return res.status(400).json({message: "Confirm belum centang"});
        const random = (min, max)=>Math.floor(Math.random() * (max - min) ) + min;
        if(!avatar) avatar = (sex === 'l') ? `${SERVER_URL}images/male${random(1,10)}.png` : `${SERVER_URL}images/female${random(1,5)}.png`;
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        try {
            const createduser = await Users.create({
                avatar: avatar,
                firstName: firstName,
                lastName: lastName,
                username: username,
                sex: sex,
                address: address,
                phone:phone,
                dateOfBirth: dateOfBirth,
                email: email,
                password: hashPassword,
                id_google:idGoogle
            });
            const user = createduser.toJSON();
            const userId = user.id;
            addUser(userId, idSocket);
            const accessToken = jwt.sign({userId, avatar, firstName, lastName}, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '20s'
            });
            const refreshToken = jwt.sign({userId, avatar, firstName, lastName}, process.env.REFRESH_TOKEN_SECRET,{
                expiresIn: '1d'
            });
            await Users.update({refresh_token: refreshToken},{
                where:{
                    id: userId
                }
            });
            res.cookie('refreshToken', refreshToken,{
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            });
            res.json({ accessToken });
        } catch (error) {
            console.log(error)
            return res.status(400).json({message:"Email Sudah Dipakai"});
        }
    }
}

export const Login = (addUser) =>{
    return async(req, res) => {
        try {
            const [user] = await Users.findAll({
                where:{
                    [Op.or]:[
                        {email: req.body.user},
                        {username: req.body.user}
                    ]
                }
            });
            const match = await bcrypt.compare(req.body.password, user.password);
            if(!match) return res.status(400).json({msg: "Wrong Password"});
            const userId = user.id;
            addUser(userId, req.body.idSocket);
            const avatar = user.avatar;
            const firstName = user.firstName;
            const lastName = user.lastName;
            const accessToken = jwt.sign({userId, avatar, firstName, lastName}, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '20s'
            });
            const refreshToken = jwt.sign({userId, avatar, firstName, lastName}, process.env.REFRESH_TOKEN_SECRET,{
                expiresIn: '1d'
            });
            await Users.update({refresh_token: refreshToken},{
                where:{
                    id: userId
                }
            });
            res.cookie('refreshToken', refreshToken,{
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            });
            res.json({ accessToken });
        } catch (error) {
            res.status(404).json({msg:"Email tidak ditemukan"});
        }
    }
}

export const Logout = (logoutUser) =>{
    return async(req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.sendStatus(204);
        const user = await Users.findAll({
            where:{
                refresh_token: refreshToken
            }
        });
        if(!user[0]) return res.sendStatus(204);
        const userId = user[0].id;
        logoutUser(userId);
        await Users.update({refresh_token: null},{
            where:{
                id: userId
            }
        });
        req.logout();
        res.clearCookie('refreshToken');
        return res.sendStatus(200);
    }
}

export const addOrDelFavorite = async(req, res)=>{
    const {idUser,idField} = req.body
    try{
        const [fav, created] = await favorite.findOrCreate({
            where:{field_id:idField},
            defaults:{user_id:idUser}
        })
        if (created) {
            res.json({status:"added"})
        }else{
            await favorite.destroy({
                where:{
                    field_id:idField,
                }
            })
            res.json({status:"deleted"})
        }
    }catch(e){;
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const checkFavorite = async(req, res)=>{
    const {idUser,idField} = req.body
    try{
        const isExist = await favorite.findOne({
            where:{field_id:idField},
            defaults:{user_id:idUser}
        })
        if (isExist) {
            res.json({status:"added"})
        }else{
            res.json({status:"none"})
        }
    }catch(e){
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const getChat = (io, connectedUsers)=> {
    return async(req, res) =>{
        const {idInbox, idTarget} = req.body;
        try{
            const chatData = await chat.findAll({
                where:{
                    inbox_id:idInbox
                },
                attributes:{exclude:['updatedAt', 'inbox_id']}
            });
            const messageChange = chatData.filter(addChat=>!addChat.read).length;
            if(messageChange > 0){
                const target = connectedUsers.find(exist=>exist.user === idTarget);
                if(target){
                    io.to(target.id).emit(SEEN_MESSAGE, [idInbox, messageChange]);
                }
            }
            res.json(chatData);
        }catch(e){
            console.log(e);
            return res.status(400).json({ 
                "state": 'error',
                "message": e.message
            });
        }
    }
}

export const getInboxList = async(req, res) =>{
    const {user} = req.body;
    try{
        const fromData = await fromChat.findOne({
            where:{
                user_id:user
            }
        })
        const toData = await toChat.findOne({
            where:{
                user_id:user
            }
        })
        const query = [];
        if(fromData){
            const idFrom = fromData.toJSON().id;
            query.push({from:idFrom});
        }
        if(toData){
            const idTo = toData.toJSON().id;
            query.push({to:idTo});
        }
        const inboxData = await inbox.findAll({
            where:{
                [Op.or]:query
            },
            attributes:['id','message', 'unread', 'updatedAt','toread'],
            include:[{
                model:fromChat,
                required:true,
                include:{
                    model:Users,
                    required:true,
                    attributes:['id', 'avatar', 'firstName', 'lastName'],
                }
            },
            {
                model:toChat,
                required:true,
                include:{
                    model:Users,
                    required:true,
                    attributes:['id', 'avatar', 'firstName', 'lastName'],
                }
            },
            ]
        });
        res.json(inboxData);
    }catch(e){
        console.log(e);
        return res.status(400).json({ 
            "state": 'error',
            "message": e.message
        });
    }
}

export const readChat = (io, connectedUsers)=>{ 
    return async(req, res)=>{
        const {idInbox, user, idTarget} = req.body;
        try{
            const [inboxChange] = await inbox.update({ unread:0 },{
                where:{
                    id:idInbox,
                    toread:user
                }
            })
            const [messageChange] = await chat.update({ read:true },{
                where:{
                    inbox_id:idInbox,
                    from:idTarget,
                    read:false
                }
            });
            if(inboxChange >0 && messageChange >0){
                const target = connectedUsers.find(exist=>exist.user === idTarget);
                if(target){
                    io.to(target.id).emit(SEEN_MESSAGE, [idInbox, messageChange]);
                }
            }
            res.json({ 
                "state": 'sucess',
                "message": "Berhasil Dibuat"
            });
        }catch(e){
            console.log(e);
            return res.status(400).json({ 
                "state": 'error',
                "message": e.message
            });
        }
    }
}

export const sendChat = (io, connectedUsers)=>{
    return async(req, res) =>{
        const {msg, from, to, idInbox} = req.body;
        try{
            const [createdFrom] = await fromChat.findOrCreate({
                where:{
                    user_id:{[Op.or]:[from, to]}
                },
                defaults:{
                    user_id:from
                },
            });
            const idFrom = createdFrom.toJSON().id;
            const userTo = (createdFrom.toJSON().user_id === to)? from : to;
            const [createdTo] = await toChat.findOrCreate({
                where:{
                    user_id:userTo
                }
            });
            const idTo = createdTo.toJSON().id;
            const optionInbox = {
                    attributes:['id','message', 'unread', 'updatedAt','toread'],
                    include:[{
                        model:fromChat,
                        required:true,
                        include:{
                            model:Users,
                            required:true,
                            attributes:['id', 'avatar', 'firstName', 'lastName'],
                        }
                    },
                    {
                        model:toChat,
                        required:true,
                        include:{
                            model:Users,
                            required:true,
                            attributes:['id', 'avatar', 'firstName', 'lastName'],
                        }
                    },
                    ]
                }
            const [createdInbox, created] = await inbox.findOrCreate({
                where:{
                    from:idFrom,
                    to:idTo
                },
                defaults:{
                    message:msg,
                    unread:1,
                    toread:to
                },
                ...optionInbox
            });
            let inboxData = createdInbox.toJSON();
            const idInbox = inboxData.id;
        
            if(!created){
                const unread = (inboxData.toread === to)? parseInt(inboxData.unread)+1 : 1;
                const updatedInbox = await inbox.update(
                    {
                        message:msg,
                        toread:to,
                        unread:unread
                    },
                    {
                        where:{id:idInbox},
                    }
                ).then(async()=>{
                    return await inbox.findOne({
                        where:{
                            id:idInbox
                        },
                        ...optionInbox
                    })
                })
                inboxData = updatedInbox;
            }
            
            const message = await chat.create({
                message:msg,
                inbox_id:idInbox,
                from:from,
            });

            await inbox.update({ unread:0 },{
                where:{
                    id:idInbox,
                    toread:from
                }
            })
            await chat.update({ read:true },{
                where:{
                    inbox_id:idInbox,
                    from:to,
                    read:false
                }
            });
            const target = connectedUsers.find(exist=>exist.user === to);
            if(target){
                io.to(target.id).emit(RECEIVE_MESSAGE, {inboxData, message});
                io.to(target.id).emit(SEEN_MESSAGE, [idInbox]);
            }
            res.json({inboxData, message});
        }catch(e){
            console.log(e);
            return res.status(400).json({ 
                "state": 'error',
                "message": e.message
            });
        }
    }
}

// export const readChat = async(req, res) =>{
//     const {id} = req.body;
//     try{
//         await chat.update({ read:true },{
//             where:{
//                 id:id
//             }
//         });
//     }catch(e){
//         console.log(e);
//         return res.status(400).json({ 
//             "state": 'error',
//             "message": e.message
//         });
//     }
// }