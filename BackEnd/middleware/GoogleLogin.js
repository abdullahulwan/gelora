import jwt from "jsonwebtoken";
import jwt_simple from 'jwt-simple';
import { Users } from "../models/UserModel.js";

export const GoogleLogin = async(req, res, next) =>{
    try{
        const {id, name, emails, photos} = req.user;
        const dataUser = await Users.findOne({
            where: {
                id_google:id
            }
        });
        console.log(id);
        if(dataUser){
            const user = dataUser.toJSON();
            const userId = user.id;
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
            res.redirect(`http://localhost:3000/`);
        }else{
            let token = jwt_simple.encode({id, name, emails, photos}, process.env.ACCESS_TOKEN_SECRET);
            res.redirect(`http://localhost:3000/signin/${token}`);
        }
    }catch(error){
        next(error);
    }
};