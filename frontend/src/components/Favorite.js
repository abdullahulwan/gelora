import {useEffect, useState} from 'react'
import {
    InputGroup,
    FormControl,
    Button,
    Form,
    ButtonToolbar,
    ButtonGroup
} from 'react-bootstrap'
import { Icon } from '@iconify/react';
import {Link} from 'react-router-dom'
import { sendPostToken } from './Logic/GetRequest';

function Favorite(props) {
    const [list, setList] = useState([]);
    const [keyword, setKeyword] = useState('');
    useEffect(()=>{
        window.scrollTo(0, 0);
        if(props.id){
            sendPostToken('/favorite/list',{idUser:props.id}, props.token).then(setList);
        }
    },[props]);
    const favoriteFinder = (e) =>{
        e.preventDefault();
        sendPostToken('/favorite/finder',{idUser:props.id, keyword:keyword}, props.token).then(setList);
    }
  return (
    <div className='container'>
        <h1 className='fw-height mt-3'>Favorite</h1>
        <div className='d-flex justify-content-between'>
            <form onSubmit={favoriteFinder} className='w-50'>
                <InputGroup className="mb-3 search-chat">
                    <FormControl
                        placeholder="Cari di Favorite"
                        aria-describedby="basic-addon2"
                        className='border-end-0'
                        value={keyword}
                        onChange={e=>setKeyword(e.target.value)}
                    />
                    <Button type="submit" variant="white" className='border border-start-0' id="button-addon2">
                        <Icon icon="bx:search-alt" width={28} className='text-warning' />
                    </Button>
                </InputGroup>
            </form>
            <h5 className="text-end align-self-center">
                Urutkan :
                <Form.Select aria-label="Urutan" className="urutan">
                    <option value="Terdekat" selected>Terdekat</option>
                    <option value="Harga Tertinggi">Harga Tertinggi</option>
                    <option value="Harga Terendah">Harga Terendah</option>
                    <option value="Urutan">Urutan</option>
                    <option value="Relevansi">Relevansi</option>
                </Form.Select>
            </h5>
        </div>
        <div className="d-flex justify-content-center flex-wrap">
            {list.map(item=>
                <div key={item.id} className="item-lapang d-flex flex-column bd-highligh no-u text-dark">
                    <Link to={`/detail/${item.field.id}`} className='bd-highlight'>
                        <img src={item.field.images[0].source} className="img-item-card" alt={item.field.name}/>
                    </Link>
                    <div className="p-2 mt-auto bd-highlight">
                        <Link to={`/detail/${item.field.id}`} className="no-u text-dark">
                            <h5 className="fw">{item.field.name}</h5>
                        </Link>
                        <p className="fs-4">Rp. {item.field.price},-</p>
                        <div className="d-flex justify-content-between">
                            <p id="jml-ulasan" className="m-0">Ulasan :</p>
                            <p id="daerah" className="m-0">{item.field.city.name}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}

export default Favorite