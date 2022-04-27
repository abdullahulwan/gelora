import {
  ProgressBar, 
  Row, 
  Col,
  ToggleButton
} from 'react-bootstrap';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ModalPesan from './Modal/ModalPesan';
import ModalChat from './Modal/ModalChat';
import { getData, postJsonTokenAlert, sendPostToken } from './Logic/GetRequest';
import ImageViewer from 'react-simple-image-viewer';
import moment from 'moment'
import Swal from 'sweetalert2';

function Detail(props) {
  const [fieldId, setFieldId] = useState('')
  const [star, setStar] = useState(0);
  const [modalPesan, setModalPesan] = useState(false);
  const [modalChat, setModalChat] = useState(false);
  const [background, setBackground] = useState('');
  const [profileField, setProfileField] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [map, setMap] = useState('');
  const [user, setUser] = useState({});
  const [images, setImages] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [facility, setFacility] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [fieldChoosers, setFieldChoosers] = useState([]);
  const [fab, setFab] = useState(false);
  const {id} = useParams();
  const navigate = useNavigate();

  const openImageViewer = useCallback((index) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  useEffect(()=>{
    window.scrollTo(0, 0);
    getData(`/field/${id}`)
      .then((fields)=>{
        setFieldId(fields.id);
        setFieldChoosers(fields.field_choosers);
        setName(fields.name);
        setPrice(fields.price);
        setDescription(fields.description);
        setAddress(fields.address);
        setMap(fields.map);
        setUser(fields.user);
        const profField = fields.images.find(e=>e.type === "profile").source;
        setProfileField(profField);
        const bg = fields.images.find(e=>e.type === "background");
        setBackground((bg)? bg.source : profField);
        setImages(fields.images.map(img=>img.source));
        setSchedules(fields.schedules);
        setFacility(fields.facility_fields);
      }).catch(()=>{
          Swal.fire(
              'Gagal mendapat Data',
              'Periksa Internet Anda Mungkin Bermsalah',
              'error'
          )
      })
  }, [id]);

  useEffect(()=>{
    if(props.id){
      sendPostToken(`/setfavorite`,{idUser:props.id,idField:id}, props.token)
      .then(({status})=>{setFab(status==="added")})
    }
  },[props]);

  const fabHandler = () =>{
    if(props.id){
      sendPostToken('/favorite', {idUser:props.id,idField:id}, props.token)
        .then(({status})=>{
          setFab(status==='added');
        });
    }
  }

  useEffect(()=>{
    const elmBg = document.getElementById('bg');
    const elmProfile = document.getElementById('profile');
    elmBg.style.backgroundImage = `url('${background}')`;
    elmBg.style.backgroundSize = "cover";
    elmProfile.style.backgroundImage = `url('${user.avatar}')`;
    elmProfile.style.backgroundSize = "cover";
    elmProfile.style.backgroundPositionY = "50%";
    // const elmUser = document.getElementById('userprof');
    // elmUser.style.backgroundImage = `url('${user.avatar}')`;
    // elmUser.style.backgroundSize = "cover";
    // elmUser.style.backgroundPositionY = "50%";
  }, [background, user.avatar])

  return (
    <div>
        <ModalPesan
        show={modalPesan}
        price={price}
        schedules={schedules}
        fieldChoosers={fieldChoosers}
        idField={fieldId}
        idUser={props.id}
        onHide={() => setModalPesan(false)}
        send={(input,success)=>{
          if(props.token){
            postJsonTokenAlert('/order/add', input, props.token)
             .then(()=>{
               console.log("halo")
              Swal.fire(
                'Berasil',
                'Berhasil Ditambahkan',
                'success'
                );
                setModalPesan(false);
                success();
                navigate('/order')
              });
          }else{
            navigate('/singnin');
          }
        }}
        />
        <ModalChat
        show={modalChat}
        onHide={() => setModalChat(false)}
        />
        <div id="bg">
          <div className="container">
            <div id="header-detail" className="row">
              <div className="col-3 px-0">
                <img src={profileField} alt={`lapang ${name}`} className="w-100"/>
              </div>
              <div className="col-9 pb-2">
                <div className="d-flex justify-content-between flex-nowrap">
                  <h3 className="fw-bold">{name}</h3>
                  <ToggleButton
                  className="my-2 ms-2 fw-bold"
                  id="favorite"
                  type="checkbox"
                  variant="outline-danger"
                  checked={fab}
                  value="1"
                  onChange={fabHandler}
                >
                  <Icon icon="carbon:favorite" className='me-3' width={24} />
                  Favorite
                </ToggleButton>
                </div>
                <Icon icon="emojione:star" color="#444" width="18" />
                <Icon icon="emojione:star" color="#444" width="18" />
                <Icon icon="emojione:star" color="#444" width="18" />
                <Icon icon="emojione:star" color="#444" width="18" />
                <p className="d-inline"> 4.7 (10 Ulasan)</p>
                <p>Dipesan : 123Kali</p>
                <h3 className="fw-bold">Rp. {price},-/jam</h3>
                <p>Pemilik : Brooklyn Simmons</p>
                <div>
                  <Icon icon="entypo:location-pin" color="#666" />
                  <p className="d-inline">{address}</p>
                </div>
                <div className='mt-3 position-relative me-2'>
                  <button id="pesan" className="btn btn-danger text-white fw-bold me-2" onClick={() => setModalPesan(true)}>Pesan</button>
                  <button id="chat" className="btn btn-outline-primary fw-bold" onClick={() => setModalChat(true)}>Chat</button>
                  <button id="share" className="btn btn-outline-secondary fw-bold position-absolute bottom-1 end-0" >
                    <Icon icon="bi:share-fill" className='me-3' width={24} />
                    Share
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div id="main-detail">
            <h4 className="fw-bold">Fasilitas</h4>
            <div className="d-flex justify-content-evenly flex-wrap mx-1">
              {facility.map(f=>
                <div key={f.id} className="mb-2">
                  {(f.facility.type === "icon")?
                    <Icon icon={f.facility.src} color="#666" height={24} className="d-block m-auto"/>
                    :
                    <img src={f.facility.src} alt={`icon ${f.id}`} height={24} className="d-block m-auto"/>
                  }
                  <p>{f.facility.name}</p>
                </div>
                )}
            </div>
            <h4 className="fw-bold">Buka</h4>
            <table className="border-0 fw-bold mx-1">
              <tbody>
                {schedules.map(({id, day, open, close})=>
                  <tr key={id}>
                    <td>{day}</td>
                    <td className='ps-3'>{moment(open, 'HH:mm:sss').format('HH:mm')} - {moment(close, 'HH:mm:sss').format('HH:mm')}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <h4 className="fw-bold">Deskripsi</h4>
            <p className="mx-1">{description}</p>
            <h4 className="fw-bold">Foto</h4>
            <div className="mx-1 d-flex flex-wrap pointer mb-2">
              {images.map((src, index) => (
                <img
                  src={ src }
                  onClick={ () => openImageViewer(index) }
                  className='align-self-baseline'
                  width="300"
                  key={ index }
                  style={{ margin: '2px' }}
                  alt=""
                />
              ))}
            </div>

            {isViewerOpen && (
              <ImageViewer
                src={ images }
                currentIndex={ currentImage }
                disableScroll={ false }
                closeOnClickOutside={ true }
                onClose={ closeImageViewer }
              />
            )}
            <h4 className="fw-bold">Lokasi</h4>
            <iframe src={map} width="100%" height="300" style={{ border: 0 }} allowFullScreen="" loading="lazy" title='map'></iframe>
            <h4 className="fw-bold">Pemilik</h4>
            <div className="mx-1 d-flex align-content-center align-items-center">
              <div id="profile" className='d-inline me-2'></div>
              <p className="fw-bold d-inline mb-0">{user.firstName} {user.lastName}</p>
            </div>
          </div>
          <div id="ulasan">
            <h4 className="fw-bold">Ulasan</h4>
            <Row className="mx-1 pb-3">
              <Col>
                <Row>
                  <div className='col-1'>
                    <Icon icon="emojione:star" color="#444" width="20" />
                    <p className='d-inline ms-1 mb-0'>5</p>
                  </div>
                  <div className='col align-self-center'>
                    <div className='progress d-inline w-100'>
                      <ProgressBar variant="danger" now={70} />
                    </div>
                  </div>
                  <div className="col-1">
                    <p className='text-center mb-0'>7</p>
                  </div>
                </Row>
                <Row>
                  <div className='col-1'>
                    <Icon icon="emojione:star" color="#444" width="20" />
                    <p className='d-inline ms-1 mb-0'>4</p>
                  </div>
                  <div className='col align-self-center'>
                    <div className='progress d-inline w-100'>
                      <ProgressBar variant="danger" now={30} />
                    </div>
                  </div>
                  <div className="col-1">
                    <p className='text-center mb-0'>3</p>
                  </div>
                </Row>
                <Row>
                  <div className='col-1'>
                    <Icon icon="emojione:star" color="#444" width="20" />
                    <p className='d-inline ms-1 mb-0'>3</p>
                  </div>
                  <div className='col align-self-center'>
                    <div className='progress d-inline w-100'>
                      <ProgressBar variant="danger" now={0} />
                    </div>
                  </div>
                  <div className="col-1">
                    <p className='text-center mb-0'>0</p>
                  </div>
                </Row>
                <Row>
                  <div className='col-1'>
                    <Icon icon="emojione:star" color="#444" width="20" />
                    <p className='d-inline ms-1 mb-0'>2</p>
                  </div>
                  <div className='col align-self-center'>
                    <div className='progress d-inline w-100'>
                      <ProgressBar variant="danger" now={0} />
                    </div>
                  </div>
                  <div className="col-1">
                    <p className='text-center mb-0'>0</p>
                  </div>
                </Row>
                <Row>
                  <div className='col-1'>
                    <Icon icon="emojione:star" color="#444" width="20" />
                    <p className='d-inline ms-1 mb-0'>1</p>
                  </div>
                  <div className='col align-self-center'>
                    <div className='progress d-inline w-100'>
                      <ProgressBar variant="danger" now={0} />
                    </div>
                  </div>
                  <div className="col-1">
                    <p className='text-center mb-0'>0</p>
                  </div>
                </Row>
              </Col>
              <Col className="d-flex justify-content-end">
                <div className='align-self-baseline'>
                  <h1 className='fw-bold fs-1 border border-5 border-danger rounded-circle d-inline p-3'>4.7</h1>
                  <div className="mt-3">
                    <Icon icon="emojione:star" color="#444" width="18" />
                    <Icon icon="emojione:star" color="#444" width="18" />
                    <Icon icon="emojione:star" color="#444" width="18" />
                    <Icon icon="emojione:star" color="#444" width="18" />
                    <Icon icon="emojione:star" color="#444" width="18" />
                  </div>
                  <p>(10) Ulasan</p>
                </div>
              </Col>
            </Row>
            <h4 className="fw-bold mt-3">Daftar Ulasan</h4>
            <p className="fw-bold d-inline me-3">Filter</p>
            <ToggleButton
                className="mb-2 me-3 rounded-pill"
                id="futsal"
                type="checkbox"
                variant="outline-primary"
                checked={star === 5}
                value="1"
                onClick={() => setStar(5)}
            >
              <Icon icon="emojione:star" color="#444" width="18" />
              <Icon icon="emojione:star" color="#444" width="18" />
              <Icon icon="emojione:star" color="#444" width="18" />
              <Icon icon="emojione:star" color="#444" width="18" />
              <Icon icon="emojione:star" color="#444" width="18" />
            </ToggleButton>
            <ToggleButton
                className="mb-2 me-3 rounded-pill"
                id="futsal"
                type="checkbox"
                variant="outline-primary"
                checked={star === 4}
                value="1"
                onClick={(e) => setStar(4)}
            >
              <Icon icon="emojione:star" color="#444" width="18" />
              <Icon icon="emojione:star" color="#444" width="18" />
              <Icon icon="emojione:star" color="#444" width="18" />
              <Icon icon="emojione:star" color="#444" width="18" />
            </ToggleButton>
            <ToggleButton
                className="mb-2 me-3 rounded-pill"
                id="futsal"
                type="checkbox"
                variant="outline-primary"
                checked={star === 3}
                value="1"
                onClick={(e) => setStar(3)}
            >
                <Icon icon="emojione:star" color="#444" width="18" />
                <Icon icon="emojione:star" color="#444" width="18" />
                <Icon icon="emojione:star" color="#444" width="18" />
            </ToggleButton>
            <ToggleButton
                className="mb-2 me-3 rounded-pill"
                id="futsal"
                type="checkbox"
                variant="outline-primary"
                checked={star === 2}
                value="1"
                onClick={(e) => setStar(2)}
            >
                <Icon icon="emojione:star" color="#444" width="18" />
                <Icon icon="emojione:star" color="#444" width="18" />
            </ToggleButton>
            <ToggleButton
                className="mb-2 me-3 rounded-pill"
                id="futsal"
                type="checkbox"
                variant="outline-primary"
                checked={star === 1}
                value="1"
                onClick={(e) => setStar(1)}
            >
                <Icon icon="emojione:star" color="#444" width="18" />
            </ToggleButton>
            <div className="item-user-ulasan">
              <div className="d-flex align-content-center align-items-center px-3 py-1">
                <img src={'#'} id="userprof" className='d-inline me-2'></img>
                <div className="fw-bold d-inline mb-0">
                  <p className="mb-0">
                    Brooklyn Simmons
                  </p>
                  <div>
                    <Icon icon="emojione:star" color="#444" width="18" />
                    <Icon icon="emojione:star" color="#444" width="18" />
                    <Icon icon="emojione:star" color="#444" width="18" />
                    <Icon icon="emojione:star" color="#444" width="18" />
                    <Icon icon="emojione:star" color="#444" width="18" />
                  </div>
                </div>
              </div>
              <div className="bg-light px-3 bottom-rounded">Fasilitas di Lapang Ini Sangat lengkap</div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Detail