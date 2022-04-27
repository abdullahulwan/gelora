import {Users} from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = (addUser)=>{
    return async(req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if(!refreshToken) return res.sendStatus(401);
            const [user] = await Users.findAll({
                where:{
                    refresh_token: refreshToken
                }
            });
            if(!user) return res.sendStatus(403);
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if(err) return res.sendStatus(403);
                const userId = user.id;
                if(req.body.idSocket){
                    addUser(userId, req.body.idSocket);
                }
                const avatar = user.avatar;
                const firstName = user.firstName;
                const lastName = user.lastName;
                const accessToken = jwt.sign({userId, avatar, firstName, lastName}, process.env.ACCESS_TOKEN_SECRET,{
                    expiresIn: '15s'
                });
                res.json({ accessToken });
            });
        } catch (error) {
            console.log(error);
        }
    }
}