import {useEffect, useState} from 'react'
import DatePicker from "react-multi-date-picker"
import { Icon } from '@iconify/react';
import {
  Row,
  Button,
  Form
} from 'react-bootstrap';
import { postWithFile, sendPostToken } from '../Logic/GetRequest'
import Swal from 'sweetalert2'
import moment from 'moment';

function Account(props) {
    const [userId, setUserId] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState('');
    const [sex, setSex] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if(loading){
          isLoading();
      }

    }, [loading])
    

    const isLoading = async () =>{
        let timerInterval;
        let timeOut = 500;
        await Swal.fire({
        title: 'Loading',
        html: 'Sedang mengubah',
        timer: 500,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading()
            timerInterval = setInterval(() => {
                if(loading && Swal.getTimerLeft() < 100 && timeOut < 6000){
                    Swal.increaseTimer(200);
                    timeOut += 200;
                }else{
                    setLoading(false);
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

    useEffect(()=>{
        setToken(props.token);
        setUserId(props.data.id);
        setAvatar(props.data.avatar);
        setName(`${props.data.firstName} ${props.data.lastName}`);
        setUsername(props.data.username);
        setSex(props.data.sex);
        setDateOfBirth(props.data.dateOfBirth);
        setAddress(props.data.address);
        setPhone(props.data.phone);
        setEmail(props.data.email);
    }, [props.data, props.token]);

    useEffect(()=>{
        const elpro = document.getElementById('chprofile');
        elpro.style.backgroundImage = `url(${avatar})`;
        elpro.style.backgroundSize = "cover";
    }, [avatar])

    const showEdit = (element) =>{
        const elm = element.target.parentElement;
        elm.parentElement.children[1].style.display= 'block';
        elm.style.display = 'none';
    }

    const hideEdit = (element) =>{
        const elm = element.target.parentElement.parentElement.parentElement;
        elm.parentElement.children[0].style.display = 'block';
        elm.style.display = 'none';
    }

    const [_firstName, set_FirstName] = useState('');
    const [_lastName, set_LastName] = useState('');
    const [_username, set_Username] = useState('');
    const [_dateOfBirth, set_DateOfBirth] = useState('');
    const [_address, set_Address] = useState('');
    const [_sex, set_Sex] = useState('');
    const [_phone, set_Phone] = useState('');
    const [_email, set_Email] = useState('');
    const [_password, set_Password] = useState('');
    const [_confirm, set_Confirm] = useState('');

    const send = (e, req) =>{
        Swal.fire({
            title: `Apakah anda yakin mengubah ${req} ?`,
            showDenyButton: true,
            confirmButtonText: 'Simpan',
            denyButtonText: `Batalkan`,
        }).then((result) => {
            if (result.isConfirmed) {
                setLoading(true);
                let data = { id: userId, request:req };
                switch (req) {
                    case "name":
                        data.firstName = _firstName;
                        data.lastName = _lastName;
                        break;
                    case "sex":
                        data.sex = _sex;
                        break;
                    case "address":
                        data.address = _address;
                        break;
                    case "phone":
                        data.phone = _phone;
                        break;
                    case "dateofbirth":
                        data.dateOfBirth = _dateOfBirth;
                        break;
                    case "username":
                        data.username = _username;
                        break;
                    case "email":
                        data.email = _email;
                        break;
                    case "password":
                        data.password = _password;
                        data.confirm = _confirm;
                        break;
                    default:
                        break;
                }
                sendPostToken(`/user/update`, data, token)
                    .then(res=>{
                        if(res.status === 'success'){
                            setLoading(false);
                            Swal.fire(
                            'Upadate!',
                            'Perubahan Berhasil',
                            'success'
                            );
                            hideEdit(e);
                            props.setUpdate(true);
                        }else{
                            Swal.fire('Terjadi kesalahan', res.message, res.status);
                        }
                    })
            } else if (result.isDenied) {;
                Swal.fire({
                    icon: 'info',
                    title: 'Perubahan dibatalkan',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        })
    }

    const update = (e, type) =>{
        e.preventDefault();
        send(e, type);
    }

    const uploadfile = (file) =>{
        if(file){
            Swal.fire({
                title: `Apakah anda yakin mengubah gambar Profile?`,
                showDenyButton: true,
                confirmButtonText: 'Simpan',
                denyButtonText: `Batalkan`,
            }).then((result) => {
                if (result.isConfirmed) {
                    setLoading(true);
                    const sendFile = new FormData();
                    sendFile.append('id', userId);
                    sendFile.append('type', 'avatar');
                    sendFile.append('avatar', file);
                    console.log(file);
                    postWithFile(`/user/update`, sendFile, token)
                        .then((result)=>{
                            if(result.status === 'success'){
                                setLoading(false);
                                Swal.fire({
                                    icon: result.status,
                                    title: 'Perubahan Berhasil',
                                    text: result.message,
                                    showConfirmButton: false,
                                    timer: 1500
                                })
                                props.setUpdate(true);
                            }else{
                                Swal.fire('Terjadi kesalahan', result.message, result.status);
                            }
                        })
                } else if (result.isDenied) {
                Swal.fire({
                    icon: 'info',
                    title: 'Perubahan dibatalkan',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            });
        }
    }

    return (
        <div className={props.classCom}>
            <h1 className='fw-bold d-block mb-3'>Profile</h1>
            <Row className='px-3'>
                <div className='rounded-base align-self-start box p-3 col-lg-4'>
                <h4 className='text-center'>Foto Profile</h4>
                <div id='chprofile' className='rounded-circle m-auto'>
                    <div className='w-100 h-100 rounded-circle d-flex justify-content-center opacity-0'>
                        <Button className='m-auto' onClick={()=> document.getElementById('profile').click()}>Upload</Button>
                        <input id='profile' onChange={e => uploadfile(e.target.files[0])} type='file' name='profile' className='d-none' accept='.JPG,.JPEG,.PNG'/>
                    </div>
                </div>
                <p className='mt-3'>Besar file: maksimum 1 Megabytes(1 Mb). Ekstensi file yang diperbolehkan: .JPG .JPEG .PNG</p>
                </div>
                <div className='col-lg-8'>
                <table className='border-0 w-100 data'>
                    <thead>
                    <tr>
                        <th colSpan='2' className='fw-bold'>Ubah Profile</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Nama Lengkap</td>
                        <td>
                        <div>
                            {name}
                            <Button variant='success' className='px-1 py-0 ms-2' onClick={showEdit}>Ubah</Button>
                        </div>
                        <div style={{display:'none'}}>
                            <form>
                            <input type='text' onKeyDown={e=>{if(e.key ==='Enter'){e.preventDefault(); e.blur()}}} name='fname' onChange={e => set_FirstName(e.target.value)} placeholder='Nama Dapan'/>
                            <input type='text' onKeyDown={e=>{if(e.key ==='Enter'){e.preventDefault(); e.blur()}}} name='lname' onChange={e => set_LastName(e.target.value)} placeholder='Nama Belakang'/>
                            <div className='pt-1'>
                                <Button variant='primary' onClick={e => update(e, "name")} className='px-1 py-0 ms-2 text-white'>simpan</Button>
                                <Button type='reset' variant='secondary' className='px-1 py-0 ms-2' onClick={hideEdit}>Batal</Button>
                            </div>
                            </form>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        Username
                        </td>
                        <td>
                        <div>
                            {username}
                            <Button variant='success' className='px-1 py-0 ms-2' onClick={showEdit}>{(username)?'Ubah':'Tambahkan'}</Button>
                        </div>
                        <div style={{display:'none'}}>
                            <form>
                            <input type='text' onKeyDown={e=>{if(e.key ==='Enter'){e.preventDefault(); e.blur()}}} onChange={e => set_Username(e.target.value)} name='username' placeholder='Username'/>
                            <div className='pt-1'>
                                <Button variant='primary' onClick={e => update(e, "username")} className='px-1 py-0 ms-2 text-white'>simpan</Button>
                                <Button type='reset' variant='secondary' className='px-1 py-0 ms-2' onClick={hideEdit}>Batal</Button>
                            </div>
                            </form>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        Tanggal Lahir
                        </td>
                        <td>
                        <div>
                            {(dateOfBirth)? moment(dateOfBirth).format("DD MMMM YYYY") : ''}
                            <Button variant='success' className='px-1 py-0 ms-2' onClick={showEdit}>{(dateOfBirth)?'Ubah':'Tambahkan'}</Button>
                        </div>
                        <div style={{display:'none'}}>
                            <form>
                            <DatePicker
                                value={_dateOfBirth}
                                onChange={set_DateOfBirth}
                            />
                            <div className='pt-1'>
                                <Button variant='primary' onClick={e => update(e, "dateofbirth")} className='px-1 py-0 ms-2 text-white' >simpan</Button>
                                <Button type='reset' variant='secondary' className='px-1 py-0 ms-2' onClick={hideEdit}>Batal</Button>
                            </div>
                            </form>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        Jenis kelamin
                        </td>
                        <td>
                        <div>
                            {(sex ===  'l')? 'laki - laki' : ''}
                            {(sex ===  'p')? 'Perempuan' : ''}
                            <Button variant='success' className='px-1 py-0 ms-2' onClick={showEdit}>{(sex)?'Ubah':'Tambahkan'}</Button>
                        </div>
                        <div style={{display:'none'}}>
                            <form>
                            <Form.Check inline type={'radion'} className='d-inline-flex align-items-center' name="jk" id={`check-api`}>
                                <Form.Check.Input id='l' checked={(_sex==='l')} onChange={(e)=>set_Sex((e.currentTarget.checked)? 'l':'')} className='align-self-center me-1' type={'radio'} />
                                <Form.Check.Label htmlFor='l'>
                                <Icon icon="emojione-monotone:boy" width={32} className='me-1' color="#444" />
                                Laki - Laki
                                </Form.Check.Label>
                            </Form.Check>
                            <Form.Check inline type={'radion'} className='d-inline-flex align-items-center' name="jk" id={`check-api`}>
                                <Form.Check.Input id='p' checked={(_sex==='p')} onChange={(e)=>set_Sex((e.currentTarget.checked)? 'p':'')} className='align-self-center me-1' type={'radio'} />
                                <Form.Check.Label htmlFor='p'>
                                <Icon icon="emojione-monotone:girl" width={32} className='me-1' color="#444" />
                                Perempuan
                                </Form.Check.Label>
                            </Form.Check>
                            <div className='pt-1'>
                                <Button variant='primary' className='px-1 py-0 ms-2 text-white' onClick={e => update(e, 'sex')}>simpan</Button>
                                <Button type='reset' variant='secondary' className='px-1 py-0 ms-2' onClick={hideEdit}>Batal</Button>
                            </div>
                            </form>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Alamat</td>
                        <td>
                        <div>
                            {address}
                            <Button variant='success' className='px-1 py-0 ms-2' onClick={showEdit}>{(address)?'Ubah':'Tambahkan'}</Button>
                        </div>
                        <div style={{display:'none'}}>
                            <form>
                            <textarea rows={2} onChange={e=>set_Address(e.target.value)} />
                            <div className='pt-1'>
                                <Button variant='primary' className='px-1 py-0 ms-2 text-white' onClick={e=>update(e, 'address')}>simpan</Button>
                                <Button type='reset' variant='secondary' className='px-1 py-0 ms-2' onClick={hideEdit}>Batal</Button>
                            </div>
                            </form>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td>No. Telp</td>
                        <td>
                            <div>
                                {phone}
                                <Button variant='success' className='px-1 py-0 ms-2' onClick={showEdit}>{(phone)?'Ubah':'Tambahkan'}</Button>
                            </div>
                            <div style={{display:'none'}}>
                                <form>
                                <input type='tel' onKeyDown={e=>{if(e.key ==='Enter'){e.preventDefault(); e.blur()}}} name='tel' placeholder='Phone' onChange={e=>set_Phone(e.target.value)}/>
                                <div className='pt-1'>
                                    <Button variant='primary' className='px-1 py-0 ms-2 text-white' onClick={e=>update(e, 'phone')}>simpan</Button>
                                    <Button type='reset' variant='secondary' className='px-1 py-0 ms-2' onClick={hideEdit}>Batal</Button>
                                </div>
                                </form>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>
                            <div>
                                {email}
                                <Button variant='success' className='px-1 py-0 ms-2' onClick={showEdit}>{(email)?'Ubah':'Tambahkan'}</Button>
                            </div>
                            <div style={{display:'none'}}>
                                <form>
                                <input type='email' onKeyDown={e=>{if(e.key ==='Enter'){e.preventDefault(); e.blur()}}} name='email' placeholder='Email' onChange={e=>set_Email(e.target.value)}/>
                                <div className='pt-1'>
                                    <Button variant='primary' className='px-1 py-0 ms-2 text-white' onClick={e=>update(e, 'email')}>simpan</Button>
                                    <Button type='reset' variant='secondary' className='px-1 py-0 ms-2' onClick={hideEdit}>Batal</Button>
                                </div>
                                </form>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Password</td>
                        <td>
                        <div>
                            ***************
                            <Button variant='success' className='px-1 py-0 ms-2' onClick={showEdit}>Ubah</Button>
                        </div>
                        <div style={{display:'none'}}>
                            <form>
                            <input type='password' onKeyDown={e=>{if(e.key ==='Enter'){e.preventDefault(); e.blur()}}} name='password' onChange={e=>set_Password(e.target.value)} placeholder='Password'/>
                            <input type='password' onKeyDown={e=>{if(e.key ==='Enter'){e.preventDefault(); e.blur()}}} name='confirm' onChange={e=>set_Confirm(e.target.value)} placeholder='Confirm Password'/>
                            <div className='pt-1'>
                                <Button variant='primary' className='px-1 py-0 ms-2 text-white' onClick={e=>update(e, 'password')}>simpan</Button>
                                <Button type='reset' variant='secondary' className='px-1 py-0 ms-2' onClick={hideEdit}>Batal</Button>
                            </div>
                            </form>
                        </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </Row>
            </div>
    )
}

export default Account