import {
  Navbar, 
  Container, 
  Nav, 
  Dropdown,
  DropdownButton, 
  InputGroup, 
  FormControl,
  Button
} from 'react-bootstrap';

import { Icon } from '@iconify/react';
import {useEffect, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom';
import { logoutAccounts, refreshToken } from './Logic/GetRequest';
import Swal from 'sweetalert2';

function Header(props) {
  const [kategori, setKategori] = useState('Semua kategori');
  const [keyword, setKeyword] = useState('')
  const [user, setUser] = useState('');
  const navigate = useNavigate();
  const sizeIcon = 28;

  useEffect(() => {
    if(props){
      setUser(props.user);
    }
  }, [props])

  const Logout = () => {
    logoutAccounts()
    .then(()=>{
      props.setToken('');
      props.setUser('');
      navigate("/");
    }).catch(()=>{
      Swal.fire(
          'Logout gagal',
          'Periksa Internet Anda Mungkin Bermsalah',
          'error'
      )
    });
  }

  const select = (e) =>{
    if(e === 'owner'){
      navigate('/admin');
    }else if(e === 'order'){
      navigate('/order');
    }else if(e === 'favorite'){
      navigate('/favorite');
    }else if(e === 'setting'){
      navigate('/setting/account');
    }else if(e === 'logout'){
      Logout();
    }
  }

  const onSubmitSearch = (e) =>{
    e.preventDefault();
    props.setKeyword({keyword:keyword, category:kategori});
    navigate("/search");
  }

  return (
    <Navbar bg="light" expand="lg" className="shadow py-2" sticky="top">
        <Container>
          <Link to="/" className="fw-bold navbar-brand">Gelora</Link>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav className="align-items-center justify-content-end w-100 me-lg-3 ms-lg-4 mt-2 mt-lg-0">
                <form className="w-100" onSubmit={onSubmitSearch}>
                  <InputGroup className="mb-2 mb-lg-0">
                    <DropdownButton
                        variant="theme-color btn-rounded-l btn-w"
                        title={kategori} 
                        id="input-group-dropdown-1"
                        className="text-center">
                      <Dropdown.Item className="text-center" onClick={()=>setKategori("Semua kategori")}>Semua kategori</Dropdown.Item>
                      <Dropdown.Item className="text-center" onClick={()=>setKategori("Futsal")}>Lapang Futsal</Dropdown.Item>
                      <Dropdown.Item className="text-center" onClick={()=>setKategori("Basket")}>Lapang Basket</Dropdown.Item>
                      <Dropdown.Item className="text-center" onClick={()=>setKategori("Bulu Tangkis")}>Lapang Bulu Tangkis</Dropdown.Item>
                      <Dropdown.Item className="text-center" onClick={()=>setKategori("Tenis")}>Lapang Tenis</Dropdown.Item>
                      <Dropdown.Item className="text-center" onClick={()=>setKategori("Voli")}>Lapang Voli</Dropdown.Item>
                    </DropdownButton>
                    <FormControl
                      placeholder="Cari"
                      aria-label="Cari"
                      aria-describedby="basic-addon2"
                      name="search"
                      value={keyword}
                      onChange={(e)=>setKeyword(e.target.value)}
                    />
                    <Button type='submit' variant="theme-color" id="button-addon2" className="btn-rounded-r">
                      <Icon icon="bx:search-alt" width={sizeIcon} />
                    </Button>
                  </InputGroup>
                </form>
            </Nav>
                
                {(Object.keys(user).length === 0)
                  ? 
                  <Nav className="d-flex align-items-center justify-content-evenly flex-row">
                    <Link to="/signin" className="py-2 text-center text-dark px-1 no-u btn btn-white d-flex flex-nowrap">
                        <Icon icon="carbon:user-avatar-filled-alt" color="black" width={sizeIcon} className="me-2"/>
                        <p className='mb-0 align-self-center'>SignIn/SignUp</p>
                      </Link>
                  </Nav>
                  :
                <Nav className="d-flex align-items-center justify-content-evenly flex-row">
                  <Link to={'/setting/update'} className="py-2 text-center btn btn-white text-dark px-1 me-1">
                    <Icon icon="ant-design:bell-filled" color="black" width={sizeIcon} />
                  </Link>
                  <Link to={'/setting/chat'} className="py-2 text-center btn btn-white text-dark px-1 me-1">
                    <Icon icon="ep:message" color="black" width={sizeIcon} />
                  </Link>
                  <Link to="/favorite" className="py-2 text-center btn btn-white text-dark px-1 me-1">
                    <Icon icon="carbon:favorite-filled" color="black" width={sizeIcon} />
                  </Link>
                  <Link to="/order" className="py-2 text-center btn btn-white text-dark px-1 me-1">
                    <Icon icon="bi:ticket-detailed" color="black" width={sizeIcon} />
                  </Link>
                  <Dropdown className="mx-3" onSelect={select}>
                      <Dropdown.Toggle variant={'white'} id="province">
                        <img src={(user.avatar)? user.avatar : ''} referrerPolicy="no-referrer" alt="avatar" className='rounded-circle' width={40} height={40} style={{objectFit:"cover"}} />
                        <p className="d-inline-block mb-0 fw-bold ms-2">{user.firstName}</p>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="list-daerah" flip={false}>
                          <Dropdown.Item eventKey="owner">Pemilik lapang</Dropdown.Item>
                          <Dropdown.Item eventKey="order">Pemesanan</Dropdown.Item>
                          <Dropdown.Item eventKey="favorite">Favorite</Dropdown.Item>
                          <Dropdown.Item eventKey="setting">Pengaturan</Dropdown.Item>
                          <Dropdown.Item eventKey="logout">Keluar</Dropdown.Item>
                      </Dropdown.Menu>
                  </Dropdown>
                </Nav>
                }
          </Navbar.Collapse>
        </Container>
      </Navbar>
  )
}

export default Header