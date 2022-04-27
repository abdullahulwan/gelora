import {useState, useEffect} from 'react'
import {
  Button,
  ToggleButton,
  Modal,
  Row,
  Accordion,
  Form,
  FloatingLabel,
  Tooltip,
  OverlayTrigger,
  Toast
} from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { Calendar } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";

import Swal from 'sweetalert2';
import {useNavigate} from 'react-router-dom';
import moment from 'moment';

function ModalPesan(props) {
  const [btnField, setBtnField] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [errorStart, setErrorStart] = useState({});
  const [errorEnd, setErrorEnd] = useState({});
  const [invalid, setInvalid] = useState({start:false,end:false});
  const [minTime, setMinTime] = useState('');
  const [maxTime, setMaxTime] = useState('')
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('')
  const [idEdit, setIdEdit] = useState(0);
  const [date, setDate] = useState([]);
  const [close, setClose] = useState([]);
  const [price, setPrice] = useState(0);
  const [orders, setOrders] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');

  const navigate = useNavigate();
  const deleteTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Hapus
    </Tooltip>
  );
  
  const editTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Edit
    </Tooltip>
  );
  const day = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
  
  useEffect(()=>{
    if(props.fieldChoosers.length >0){
      const setAllField = props.fieldChoosers.map(field=>{
        return{
          ...field,
          state:(props.fieldChoosers.length<=1)
        }
      });
      setSelectedImage(setAllField[0].image.source);
      setBtnField(setAllField);
    }
    if(props.schedules){
      const schedule_lenght = props.schedules.length;
      if(schedule_lenght>0){
        const openDay = props.schedules.map(d=>d.day);
        setClose(day.filter(d=> !openDay.includes(d)).map(sh=>day.indexOf(sh)));
        const Schedule = props.schedules.map(d=>{
          return{
            dayIdx:day.indexOf(d.day),
            day:d.day,
            open:moment(d.open,"HH:mm:ss").format("HH:mm"),
            close:moment(d.close,"HH:mm:ss").format("HH:mm")
          }
        });
        setSchedules(Schedule);
        const openTime = props.schedules.sort((a,b)=>getTime(b.open) - getTime(a.open))[0].open;
        const closeTime = props.schedules.sort((a,b)=>getTime(a.close) - getTime(b.close))[0].close;
        setMinTime(openTime);
        setMaxTime(closeTime);
      }
    }
    if(props.price){
      setPrice(props.price);
    }
    if(props.data){
      setOrders(props.data.map(item=>{
        const newItem = {...item};
        newItem.fields = props.fieldChoosers.map(field=>{
          return{
            ...field,
            state:newItem.fields.some(fieldSelected=>field.id===fieldSelected.id)
          }
        });
        newItem.date = newItem.date.map(date=>moment(date,'DD/MM/YYYY'));
        return newItem;
      }));
    }
  }, [props]);

  useEffect(() => {
    if(start){
      timeHandler(start,'start');
    }
    if(end){
      timeHandler(end,'end');
    }
  }, [minTime, maxTime])
  

  // useEffect(() => {
  //   console.log(orders);
  // }, [orders]);
  

  const lapangHandler = (index, e) =>{
    let arr = [...btnField];
    arr[index].state = e.currentTarget.checked;
    setSelectedImage(arr[index].image.source);
    setBtnField(arr);
  }

  const addOrder = () =>{
    changeOrder((data)=>setOrders(old=>[...old, data]));
  }

  const changeOrder = (cb) =>{
    if(!btnField.every((b)=>!b.state)){
      if(date.length > 0){
        const duration = diffMinutes(end,start);
        if(duration => 60){
            const orderData = {
              fields: [...btnField],
              date: date.map(d=>{
                const ds = moment(d.toString(), "DD/MM/YYYY");
                return (ds.isValid()) ? ds : moment(d.toString())
              }),
              start:start,
              end:end,
              duration:duration,
              price_total: (duration/60)*price*(date.length)*(btnField.filter((e)=> e.state).length)
            };
            cb(orderData);
            clearState();
          }else{
            Swal.fire({
              icon: 'warning',
              title: 'Pilih durasi',
              text: 'Opsi durasi tidak dipilih'
            });
          }
      }else{
        Swal.fire({
          icon: 'warning',
          title: 'Pilih Tanggal',
          text: 'Opsi tanggal tidak dipilih'
        });
      }
    }else{
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Lapang',
        text: 'Opsi lapang tidak dipilih'
      });
    }
  }

  const clearState = () =>{
    const setAllField = props.fieldChoosers.map(field=>{
      return{
        ...field,
        state:(props.fieldChoosers.length<=1)
      }
    });
    setBtnField(setAllField);
    setDate([]);
  }

  const getTime = (time)=>{
    const hours = parseInt(time.split(':')[0],10);
    const minutes = parseInt(time.split(':')[1],10);
    const setTime = new Date();
    setTime.setHours(hours);
    setTime.setMinutes(minutes);
    return setTime.getTime();
  }

  const diffMinutes = (a,b)=>{
    const diffTime = getTime(a) - getTime(b);
    return Math.ceil(diffTime / (1000 * 60));
  }

  const timeHandler = (time, type) =>{
    if(type === 'start'){
      setStart(time);
    }else{
      setEnd(time);
    }
    if(getTime(minTime) <= getTime(time) && getTime(maxTime) > getTime(time)){
      const startValue = (type === 'start') ? time : start;
      const endValue = (type === 'end')? time : end;
      if(diffMinutes(endValue,startValue) < 60 || getTime(startValue) > getTime(endValue)){
        const msg = "Minimal 1 jam lama waktu dipesan";
        if(type === 'start'){
          setErrorStart({state:true, msg:msg});
        }else{
          setErrorEnd({state:true, msg:msg});
        }
        const invalidInput = {...invalid};
        invalidInput[type] = true;
        setInvalid({...invalidInput});
      }else{
        setErrorStart({});
        setErrorEnd({});
        const invalidInput = {};
        invalidInput.start = false;
        invalidInput.end = false;
        setInvalid(invalidInput);
      }
    }else if(getTime(minTime) > getTime(time)){
      const msg = `Lapang dibuka ${minTime}`;
      if(type === 'start'){
        setErrorStart({state:true, msg:msg});
      }else{
        setErrorEnd({state:true, msg:msg});
      }
      const invalidInput = {...invalid};
      invalidInput[type] = true;
      setInvalid({...invalidInput});
    }else if(getTime(maxTime) < getTime(time)){
      const msg = `Lapang ditutup ${maxTime}`;
      if(type === 'start'){
        setErrorStart({state:true, msg:msg});
      }else{
        setErrorEnd({state:true, msg:msg});
      }
      const invalidInput = {...invalid};
      invalidInput[type] = true;
      setInvalid({...invalidInput});
    }
  }

  const cancelEdit = () =>{
    setIdEdit(0);
    clearState();
  }

  const editOrder = (index) =>{
    setIdEdit(index+1);
    // const setAllField = btnField.map(field=>{
    //   const valfield = {...field};
    //   console.log();
    //   // valfield.state = orders[index].fields.some(fd=>{ 
    //   //   return field.id === fd.id
    //   // })
    //   return valfield;
    // });
    setBtnField(orders[index].fields);
    setDate([...orders[index].date.map(d=>new Date(...d.toArray()))]);
    setStart(orders[index].start);
    setEnd(orders[index].end);
  }

  const saveEdit = () =>{
    changeOrder((data)=>{
      const ord = [...orders];
      const id = (ord[idEdit-1].id)? ord[idEdit-1].id : '';
      ord[idEdit-1] = {id,...data};
      setOrders(ord);
    });
    setIdEdit(0);
    clearState();
  }

  function deleteOrder(index) {
    const ord = [...orders];
    ord.splice(index, 1);
    setOrders(ord);
  }

  const send = () =>{
    const idUser = props.idUser;
    const idField = props.idField;
    if(idUser && idField){
      if(!invalid.start && !invalid.end){
        const body = orders.map((order,idx)=>{
          return{
            id:order.id,
            field:order.fields.filter((e)=> e.state).map(f=>f.id),
            date:order.date,
            start:order.start,
            end:order.end,
          }
        })
        props.send({ idUser:idUser, idField:idField, data:JSON.stringify(body)}, ()=>setOrders([]));
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Waktu pesanan tidak dapat digunakan',
          text: `Tentukanlah Waktu pemesanan yang sesuai`
        })
      }
    }else{
      navigate('/signin')
    }
  }

  return (
    <Modal
      {...props}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      contentClassName="modal-pesan"
    >
      <Button variant="white" onClick={props.onHide} className="p-0 position-absolute end-0 mt-1 me-2" ><Icon icon="clarity:window-close-line" color="#666" width={32} /></Button>
      <Row id="menu">
        <div className='col-lg-8 pe-0'>
          <Row>
            <div className="col-lg-5 border-end pe-4 pe-lg-0">
              <img src={selectedImage} alt="lapang 1" width="100%" id="imgModel"/>
              <div className="p-2">
                <h5 className="fw-bold">Lapang</h5>
                <div className="d-flex justify-content-center flex-wrap">
                  { btnField.map((statebtn, index) =>
                    <ToggleButton
                      key={index+1}
                      className="m-2"
                      id={"toggle-check"+index}
                      type="checkbox"
                      variant="outline-primary"
                      checked={(btnField.length>1) ? statebtn.state : true}
                      value="1"
                      onChange={(e) => lapangHandler(index,e)}
                    >
                      {statebtn.name}
                    </ToggleButton>
                  )}
                  
                </div>
              </div>
            </div>
            <div className="col-lg-7 ps-4 ps-lg-2 pe-2 pt-2">
              <h5 className="fw-bold">Tanggal Sewa</h5>
              <Calendar
                multiple
                minDate={moment().add(1, 'days').toDate()}
                value={date}
                onChange={(v)=>setDate(v)}
                format="DD/MM/YYYY"

                mapDays={({ date, selectedDate, isSameDate }) =>{
                  let isWeekend = close.includes(date.weekDay.index)
                  let props = {}
                  if (isWeekend){
                    props.disabled= true;
                    props.style = { color: "#ccc" };
                    props.onClick= () => alert("Maaf pengelola tutup dihari tersebut");
                  }else{
                    const time = schedules.find(d=>d.dayIdx === date.weekDay.index);
                    if(getTime(start)< getTime(time.open) && (start)){
                      props.disabled= true;
                      props.onClick= () =>{
                        Swal.fire({
                          icon: 'error',
                          title: 'Waktu Mulai Terlalu Awal',
                          text: `Lapang dibuka ${time.open} dihari ${time.day}`
                        })
                      }
                    }else if(getTime(end)> getTime(time.close) && (end)){
                        props.disabled= true;
                        props.onClick= () =>{
                          Swal.fire({
                            icon: 'error',
                            title: 'Waktu Selsai Terlalu Lama',
                            text: `Lapang ditutup ${time.close} dihari ${time.day}`
                          })
                        }
                    }else{
                      props.disabled= false;
                      if(selectedDate.find(select=>date.toString()===select.toString())){
                        const selectedTime = selectedDate.map(selected=>{
                          return schedules.find(d=>d.dayIdx === selected.weekDay.index);
                        })
                        const openTime = selectedTime.sort((a,b)=>getTime(b.open) - getTime(a.open))[0].open;
                        const closeTime = selectedTime.sort((a,b)=>getTime(a.close) - getTime(b.close))[0].close;
                        setMinTime(openTime);
                        setMaxTime(closeTime);
                      }
                    }
                  }
                  if ([].includes(date.day)) props.hidden = true;

                  return props
                }}
                plugins={[
                <DatePanel />,
                ]}
              />
              <h5 className="fw-bold mt-2">Waktu Sewa</h5>
              <div className="pe-3">
                <FloatingLabel
                  controlId="start-time"
                  label="Waktu Mulai"
                  className="mb-3"
                >
                  <Form.Control type="time" className={`${invalid.start ? 'error': ''}`} onChange={e=>timeHandler(e.target.value,'start')} value={start} min={minTime} max={maxTime} placeholder="time" />
                </FloatingLabel>
                <Toast onClose={() => setErrorStart({})} className='mb-3' show={(errorStart.state)? true: false}>
                  <Toast.Header>
                    <strong className="me-auto">Perhatian</strong>
                  </Toast.Header>
                  <Toast.Body>{errorStart.msg}</Toast.Body>
                </Toast>
                <FloatingLabel
                  controlId="end-time"
                  label="Waktu Selesai"
                  className="mb-3"
                >
                  <Form.Control type="time" className={`${invalid.end ? 'error': ''}`} onChange={e=>timeHandler(e.target.value,'end')} value={end} min={minTime} max={maxTime} placeholder="time" />
                </FloatingLabel>
                <Toast onClose={() => setErrorEnd({})} className='mb-3' show={(errorEnd.state)? true: false}>
                  <Toast.Header>
                    <strong className="me-auto">Perhatian</strong>
                  </Toast.Header>
                  <Toast.Body>{errorEnd.msg}</Toast.Body>
                </Toast>
              </div>
            </div>
          </Row>
            {(idEdit === 0) 
            ?
          <div className="pe-4 p-lg-2 d-flex justify-content-end border-top">
            <Button variant="success" className='rounded text-white' onClick={()=>addOrder()}>
              Tambah ke Daftar Pesanan
              <Icon icon="carbon:add" width="32" />
            </Button>
          </div>
            :
          <div className="pe-4 p-lg-2 d-flex justify-content-end border-top">
            <Button variant="success" className='rounded text-white m-1' onClick={()=>saveEdit()}>
              Simpan Perubahan
              <Icon icon="carbon:add" width="32" />
            </Button>
            <Button variant="danger" className='rounded text-white m-1' onClick={()=>cancelEdit()}>
              Batalkan Perubahan
            </Button>
          </div>
          }
        </div>
        <div className="col-lg-4 border-start d-flex flex-column ps- ps-lg-2 py-3 pe-4">
           <h5 className="fw-bold bd-highligh">Daftar Pesanan</h5>
          <div className='overflow-auto bd-highligh' style={{height:'55vh'}}>
            <Accordion defaultActiveKey="0">
              {orders.map((_order, index)=>
                <Accordion.Item key={index+1} eventKey={index}>
                  <Accordion.Header>
                    <OverlayTrigger
                      placement="left"
                      delay={{ show: 250, hide: 400 }}
                      overlay={deleteTooltip}
                    >
                      <Icon className='me-2' icon="nimbus:stop" color="red" onClick={()=>deleteOrder(index)} /> 
                    </OverlayTrigger>
                      Paket #{index+1} 
                      <OverlayTrigger
                        placement="right"
                        delay={{ show: 250, hide: 400 }}
                        overlay={editTooltip}
                      >
                        <Icon onClick={()=>editOrder(index)} className='ms-2' icon="ci:edit" color="black" />
                      </OverlayTrigger>
                  </Accordion.Header>
                  <Accordion.Body>
                    Lapang :
                    <ul>
                      {_order.fields.filter(l=>l.state).map((lap, ky)=> <li key={ky+1}>{lap.name}</li>)}
                    </ul>
                    <p>Duration : {_order.start} - {_order.end} ({_order.duration/60} Jam)</p>
                    Tanggal Pemesanan
                    <ul>
                        {_order.date.map((d,i)=>
                          <li key={i}>{moment(d).format("DD/MM/YYYY")}</li>
                          )}
                    </ul>
                    
                    Harga : Rp. {(_order.price_total)}
                  </Accordion.Body>
                </Accordion.Item>
              )}
            </Accordion>
          </div>
          {(orders.length > 0) ?
            <div className='d-flex justify-content-between mt-auto bd-highligh'>
              <p className='fw-bold fs-5 mb-0'>Total harga Rp{orders.reduce((partialSum, a) => partialSum + a.price_total, 0)}</p>
              <Button variant="primary" className="rounded mb-2 me-2" onClick={send}>{(props.save)? props.save : 'Pesan'}</Button>
            </div>
          :''}
        </div>
      </Row>
    </Modal>
  )
}

export default ModalPesan