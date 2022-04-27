import axios from 'axios';
import jwt_decode from "jwt-decode";
import Swal from 'sweetalert2';

const SERVER = "http://localhost:5000";

export const refreshToken = async (idSocket) => {
    try {
        const response = await axios.post(`${SERVER}/token`,{idSocket},{ withCredentials: true });
        const token = response.data.accessToken;
        const user = jwt_decode(token);
        return({token, user});
    } catch (error) {
        console.log(error);
    }
}

const axiosJWT = axios.create();
export const setInterceptors = (expire, onSuccess) =>{
    axiosJWT.interceptors.request.use(async (config) => {
        const currentDate = new Date();
        if (expire * 1000 < currentDate.getTime()) {
            const response = await axios.post(`${SERVER}/token`,{},{ withCredentials: true });
            const setToken = response.data.accessToken;
            config.headers.Authorization = `Bearer ${response.data.accessToken}`;
            const user = jwt_decode(response.data.accessToken);
            onSuccess(setToken, user);
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });
}

export const postWithFile = async(path, body, token, onError)=>{
    try {
      const response = await axiosJWT.post((SERVER+path), body, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      }
      );
    return response.data;

    } catch (err) {
      if (err.response.status === 500) {
        throw 'There was a problem with the server'
      } else {
        throw err.response.data.msg
      }
    }
}

export const sendPostToken = async(path,query,token)=>{
    try{
        const response = await axiosJWT.post((SERVER+path), query,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response.data
    }
}

export const sendDeleteToken = async(path,query,token)=>{
    try{
        const response = await axiosJWT.delete((SERVER+path),{
            headers: {
                Authorization: `Bearer ${token}`
            },
            data:{
                ...query
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const postAccounts = async(path, query) =>{
    try{
        const response = await axios.post((SERVER+path), query, {withCredentials: true});
        const user = jwt_decode(response.data.accessToken);
        return {token:response.data.accessToken,user};
    } catch (error) {
        throw error;
    }
}

export const logoutAccounts = async() =>{
    try{
        const response = await axios.delete(`http://localhost:5000/logout`,{ withCredentials: true });
        return response;
    } catch (error) {
        throw error;
    }
}

export const getData = async (path) => {
    try{
        const respose = await axios.get(SERVER+path);
        return respose.data;
    } catch (error) {
        throw error;
    }
}

export const postData = async (path, query) => {
    try{
        const respose = await axios.post((SERVER+path), query);
        return respose.data;
    } catch (error) {
        throw error;
    }
}

let loading = false;
const isLoading = async () =>{
    let timerInterval;
    let timeOut = 500;
    loading = true;
    await Swal.fire({
    title: 'Loading',
    html: 'Sedang Memproses Permintaan',
    timer: 500,
    timerProgressBar: true,
    didOpen: () => {
        Swal.showLoading()
        timerInterval = setInterval(() => {
            if(loading && Swal.getTimerLeft() < 200){
                Swal.increaseTimer(200);
                timeOut += 200;
            }
        }, 100)
    },
    willClose: () => {
        clearInterval(timerInterval)
    },
    allowOutsideClick: () => false
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer && timeOut > 5000) {
            Swal.fire(
                'Time Out',
                'Periksa Internet Anda Mungkin Bermsalah',
                'error'
            )
        }
    })
}

export const postJsonTokenAlert = async (path, query, token) => {
    isLoading();
    try{
        const dataResponse = await axiosJWT.post((SERVER+path), query,{
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        loading = false;
        return dataResponse.data;
    } catch (error) {
        console.log(error.response.data);
        loading = false;
        Swal.fire(
            'Gagal',
            error.response.data.message,
            'error'
            );
        throw error;
    }
}

export const postJsonToken = async (path, query, token) => {
    try{
        const dataResponse = await axiosJWT.post((SERVER+path), query,{
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        return dataResponse.data;
    } catch (error) {
        throw error;
    }
}


export const postAlert = async (path, query) => {
    isLoading();
    try{
        const respose = await axios.post((SERVER+path), query);
        loading = false;
        return respose.data;
    } catch (error) {
        loading = false;
        Swal.fire(
            'Gagal',
            error.response.data.message,
            'error'
            );
        throw error;
    }
}