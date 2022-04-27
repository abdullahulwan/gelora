import {
  Form,
  Dropdown,
  ButtonGroup,
  ToggleButton,
  Button
} from 'react-bootstrap'
import {useState, useEffect} from 'react'
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { getData, postData, postJsonTokenAlert } from '../Logic/GetRequest';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

function CreateFiend(props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [totalField, setTotalField] = useState(0);
  const [price, setPrice] = useState(0);
  const [desc, setDesc] = useState('');
  const [selectOpen, setSelectOpen] = useState([]);
  const [picture, setPicture] = useState('');
  const [province, setProvince] = useState(0);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(0);
  const [allCities, setAllCities] = useState([])
  const [allProvince, setAllProvince] = useState([])
  const [map, setMap] = useState('');
  const [sendMap, setSendMap] = useState('');
  const [background, setbackground] = useState("0");
  const [mainImage, setMainImage] = useState("0");
  const [imageLabel, setImageLabel] = useState([]);
  const [resPicture, setResPicture] = useState([]);
  const [facility, setFacility] = useState([]);
  const [label, setLabel] = useState([]);
  const navigate = useNavigate();
  const stateOpen = [
    { name: 'Senin' },
    { name: 'Selasa' },
    { name: 'Rabu' },
    { name: 'Kamis' },
    { name: `Jum'at` },
    { name: 'Sabtu' },
    { name: 'Minggu' },
  ];
  const categoryData = [
    'Voli',
    'Basket',
    'Badminton',
    'Tenis',
    'Futsal'
  ]
  const customTheme = (theme) =>{
    return {
      ...theme,
      colors: {
        ...theme.colors,
        primary25:'#FF8181',
        primary:'#FF4A4A'
      }
    }
  }
  const facilityData = [
    'Free Wifi',
    'Parkir',
    'Mushola',
    'Warung',
    'Resotorant',
    'Toko Olahraga'
  ]
  const setDay = (selected) =>{
    const arrState = [...selectOpen];
    const exist = arrState.findIndex(e => e.day === selected);
    if(exist < 0){
      arrState.push({day : selected});
    }else{
      arrState.splice(exist, 1);
    }
    setSelectOpen(arrState);
  }
  const setTime = (type, day, selected) =>{
    const arrState = [...selectOpen];
    const index = arrState.findIndex(e => e.day === day);
    arrState[index][type] = selected;
    setSelectOpen(arrState);
  }

  const ButtonSetAll = ({time, day}) =>{
    const setAll = ()=>{
      const arrState = [...selectOpen];
      const changeSchedule = arrState.map(sch=>{
        sch[time] = selectOpen.find(e => e.day === day)[time];
        return sch
      })
      setSelectOpen(changeSchedule);
    }
    return(
      <Button variant="info" onClick={setAll} className='m-1 py-0 px-1'>Semua Waktu {(time==='open')? 'Buka':'Tutup'}</Button>
    )
  }

  useEffect(() => {
    if(picture.length > 0){
      const srcImage = [];
      picture.forEach((elm) => {
        srcImage.push(URL.createObjectURL(elm));
      });
      setResPicture(srcImage);
    }
  }, [picture]);

  useEffect(()=>{
    if(totalField > 0){
      const image = [];
      for (let fieldNumber = 0; fieldNumber < totalField; fieldNumber++) {
        image.push(`lapang ${fieldNumber+1}`);
      }
      setImageLabel(image);
    }
  },[totalField])

  useEffect(() => {
    getData('/getcity').then(cities=>{
      setAllCities(cities.map(e=>{return{value:e.name, label:e.name, id:e.id, province:e.province_id}}))
    });
    getData('/getprovince').then(profinces=>{
      setAllProvince(profinces.map(e=>{return{value:e.name, label:e.name, id:e.id, province:e.province_id}}))
    });
  }, [])

  const setValue = (e, type)=>{
    if(type === 'province'){
      setProvince((e.id)? e.id:e);
      postData("/getcity",{city:'', id:e.id})
          .then(cities=>{
          setAllCities(cities.map(e=>{return{value:e.name, label:e.name, id:e.id, province:e.province_id}}))
        });
    }else if(type === 'city'){
      setCity((e.id)? e.id:e);
    }
  }

  const setInput = (value, type)=>{
    if(value){
      if(type === 'province'){
        postData("/getprofinces",{province:value})
          .then(cities=>{
          setAllProvince(cities.map(e=>{return{value:e.name, label:e.name, id:e.id, province:e.province_id}}))
        });
      }else if(type === 'city'){
        const fProvince = (province!==0) ? {id:province} : {};
        postData("/getcity",{city:value, ...fProvince})
          .then(cities=>{
          setAllCities(cities.map(e=>{return{value:e.name, label:e.name, id:e.id, province:e.province_id}}))
        });
      }
    }
  }

  const handlerFile = (file) =>{
    const picImage = [];
    for (let idx = 0; idx < file.length; idx++) {
      picImage.push(file[idx]);
    }
    setPicture(picImage);
  }

  const handlerMap = (map) =>{
    let setIndex;
    const splitMap = map.split('"');
    if(splitMap.length>2){
      const srcMap = splitMap.find((elm, idx)=>{
        if(elm.includes('src')) setIndex = idx+1;
        return setIndex === idx;
      });
      setSendMap(srcMap);
    }
    setMap(map);
  }

  const handlerFacility = (e) =>{
    const stateFacility = [...facility];
    if(facility.includes(e)){
      stateFacility.splice(stateFacility.indexOf(e), 1);
    }else{
      stateFacility.push(e)
    }
    setFacility(stateFacility);
  }

  const labelHandler = (id, value) =>{
    const arrLabel = [...label];
    if(value){
      const getlab = arrLabel.find(lab=>lab.id === id);
      if(getlab){
        const index = arrLabel.indexOf(getlab);
        arrLabel[index].name = value;
      }else{
        arrLabel.push({id:id, name:value});
      }
    }else{
      const getlab = arrLabel.find(lab=>lab.id === id);
      const index = arrLabel.indexOf(getlab);
      arrLabel.splice(index,1);
    }
    setLabel(arrLabel);
  }

  const handlerfield = (e) =>{
    e.preventDefault();
    const labelImage = 
      ((picture.length < totalField && totalField > 1) || totalField === 1)? 
      picture.map((img,idx)=>{return{id:0, name:`lapang ${idx+1}`}}).slice(0,totalField)
      :label;
    const schedule = selectOpen.map(sch=>{return{day:sch.day,open:sch.open.toString(),close:sch.close.toString()}})
    const body = new FormData();
    body.append('id', props.id)
    body.append('name',name);
    body.append('labels',JSON.stringify(labelImage));
    body.append('category',category)
    body.append('price',price);
    body.append('desc',desc);
    body.append('province',province);
    body.append('city',city);
    body.append('address',address);
    body.append('map',sendMap);
    picture.forEach(img=>{
      body.append('picture',img);
    })
    body.append('profile',mainImage);
    body.append('background',background);
    body.append('schedules',JSON.stringify(schedule));
    facility.forEach(fac=>{
      body.append('facility',fac+1);
    })
    postJsonTokenAlert('/field/add',body,props.token)
    .then(()=>{
      Swal.fire(
        'Berasil',
        'Berhasil Ditambahkan',
        'success'
        );
        // navigate('/');
    }).catch(()=>{
      Swal.fire(
        'Gagal',
        'Gagal Ditambahkan',
        'error'
        );
    });
  }
  
  return (
    <div>
      <h1>Pendaftaran lapang</h1>
      <Form onSubmit={handlerfield}>
        <Form.Label className='mb-0' htmlFor="Name">Nama Lapang</Form.Label>
        <Form.Control
          className='mb-3'
          type="text"
          id="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Form.Label className='mb-0' htmlFor="Name">Pilih Jenis lapang</Form.Label>
        <Dropdown className="mb-3 d-block" onSelect={e =>setCategory(e)}>
            <Dropdown.Toggle id="dropdown-autoclose-outside">
            {(categoryData[category])? categoryData[category] : 'Pilih Jenis'}
            </Dropdown.Toggle>

            <Dropdown.Menu flip={false}>
              {categoryData.map((catg, idx) =>
                <Dropdown.Item eventKey={idx} active={category === idx}>{catg}</Dropdown.Item>
              )}
            </Dropdown.Menu>
        </Dropdown>
        <Form.Label className='mb-0' htmlFor="price">Harga Perjam</Form.Label>
        <Form.Control
          className='mb-3'
          type="number"
          id="price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder='100000'
        />
        <Form.Label className='mb-0' htmlFor="desc">Deskipsi</Form.Label>
        <Form.Control
          className='mb-3'
          as="textarea"
          id="address"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <h5 className='my-1'>Alamat Lengkap </h5>
        <Form.Label className='mb-0' htmlFor="province">Provinsi</Form.Label>
        <Select
          theme={customTheme}
          noOptionsMessage={()=>"Tidak Temukan"}
          onChange={(e)=>setValue(e,'province')}
          onInputChange={(e)=>setInput(e,'province')}
          placeholder='Pilih Provinsi'
          className='mb-3'
          options={allProvince}
        />
        <Form.Label className='mb-0' htmlFor="city">Kota / Kabupaten</Form.Label>
        <CreatableSelect
          theme={customTheme}
          onChange={(e)=>setValue(e,'city')}
          onInputChange={(e)=>setInput(e,'city')}
          placeholder='Pilih Kota/Kabupaten'
          formatCreateLabel={(s)=>`Membuat Baru ${s}`}
          options={allCities}
        />
        <Form.Label className='mb-0' htmlFor="address">Alamat</Form.Label>
        <Form.Control
          className='mb-3'
          as="textarea"
          id="address"
          placeholder='Jl...'
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <Form.Label className='mb-0' htmlFor="map">Embed Map</Form.Label>
        <Form.Control
          className='mb-3'
          type="text"
          id="map"
          placeholder='<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.789910496412!2d107.63380126477284!3d-6.915703395003074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e7c5032605ff%3A0x76a6bdc7672f2ab5!2sGOR%20KONI%20-%20Kota%20Bandung!5e0!3m2!1sid!2sid!4v1647885582142!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
          value={map}
          onChange={e => handlerMap(e.target.value)}
        />
        
        <Form.Label className='mb-0' htmlFor="Name">Jumlah Lapang</Form.Label>
        <div className='mb-3'>
          <Form.Control
            className='w-auto'
            type="number"
            id="totalfield"
            value={totalField}
            onChange={e => setTotalField(parseInt(e.target.value))}
          />
        </div>

        <Form.Label className='mb-0 d-block' htmlFor="photo">Foto lapang</Form.Label>
        <Button className='mb-3' onClick={()=> document.getElementById('photo').click()}>Upload</Button>
        <input id='photo' onChange={e => handlerFile(e.target.files)} type='file' name='profile' className='d-none' accept='.JPG,.JPEG,.PNG' multiple/>
        {(picture.length > 0) ? 
        <div id='chooser'>
          {(picture.length > 1)?
          <p className='fw-bold'>Pilih photo profile dan background</p>
          :''}
          <div className='d-flex flex-wrap'>
            {resPicture.map((item, idx)=>
              <div key={idx} className="position-relative d-inline-block me-1 mb-1">
                <img src={item} alt={`preview-${idx}`} height={200}/>
                {(picture.length > 1)?
                  <div className='position-absolute' style={{top:'5px', left:'5px'}}>
                    <div className={`rounded-pill px-2 ${(mainImage === idx.toString())?'bg-blue':'transparent'}`}>
                      <Form.Check
                        label={`Profile`}
                        type='checkbox'
                        value={idx}
                        checked={mainImage === idx.toString()}
                        onChange={e =>setMainImage(e.currentTarget.value)}
                        className='fw-bold'
                        id={`profile-${idx}`}
                      />
                    </div>
                    <div className={`rounded-pill px-2 ${(background === idx.toString())?'bg-blue':'transparent'}`}>
                      <Form.Check
                        label={`Backgrourd`}
                        type='checkbox'
                        value={idx}
                        checked={background === idx.toString()}
                        onChange={e =>setbackground(e.currentTarget.value)}
                        className='fw-bold'
                        id={`backgrourd-${idx}`}
                      />
                    </div>
                    {(picture.length >= totalField && totalField > 1)?
                      <Dropdown onSelect={e=>labelHandler(idx,e)}>
                        <Dropdown.Toggle variant="success" className={`rounded-pill text-dark fw-bold py-1 px-2 ${(label.find(e=>e.id===idx))?'bg-blue':'transparent'}`} id="dropdown-basic" >
                          {(label.find(e=>e.id===idx))?label.find(e=>e.id===idx).name:'Label Foto'}
                        </Dropdown.Toggle>

                        <Dropdown.Menu >
                            <Dropdown.Item eventKey={''}>Tidak dipilih</Dropdown.Item>
                          {imageLabel.filter(imgLab=> !label.map(lab=>lab.name).includes(imgLab)).map(fieldLabel=>
                            <Dropdown.Item eventKey={fieldLabel}>{fieldLabel}</Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                      </Dropdown>
                    :''}
                  </div>
                  : ''
                }
              </div>
              )}
          </div>
        </div>
      :''}

        <Form.Label className='mb-0 d-block'>Hari dan Waktu Buka</Form.Label>
        <ButtonGroup className='d-block mb-3'>
        {stateOpen.map((day, idx) => (
          <div key={idx} className={`mx-2 mt-2 ${(selectOpen.find(e => e.day === day.name)) ? 'd-block':'d-inline'}`}>  
            <ToggleButton
              id={`day-${idx}`}
              type="checkbox"
              variant={'outline-success'}
              name="day"
              value={day.name}
              checked={selectOpen.find(e => e.day === day.name)}
              onChange={(e) => setDay(e.currentTarget.value)}
            >
              {day.name}
            </ToggleButton>
            <div className={`pt-2 mb-3 ${(selectOpen.find(e => e.day === day.name)) ? '':'d-none'}`}>
              <p className='d-inline'>Buka : </p>
              <DatePicker
                disableDayPicker
                placeholder="HH:mm"
                title="open"
                format="HH:mm"
                className='rounded'
                value={selectOpen.find(e => e.day === day.name)?.open}
                onChange={e => setTime('open',day.name, e)}
                plugins={[
                  <TimePicker hideSeconds />,
                  <ButtonSetAll position="bottom" time={"open"} day={day.name} />
                ]} 
              />
              <p className='ms-3 d-inline'>Tutup : </p>
              <DatePicker
                disableDayPicker
                placeholder="HH:mm"
                title="close"
                format="HH:mm"
                className='rounded'
                value={selectOpen.find(e => e.day === day.name)?.close}
                onChange={e => setTime('close',day.name, e)}
                plugins={[
                  <TimePicker hideSeconds />,
                  <ButtonSetAll position="bottom" time={"close"} day={day.name} />
                ]} 
              />
            </div>
          </div>
        ))}
      </ButtonGroup>
      <Form.Label className='mb-0 d-block'>Fasilitas yang tesedia</Form.Label>
      <div className='mb-2'>
        {facilityData.map((fac,idx)=>
          <ToggleButton
            className="mx-2"
            id={`toggle-${idx}`}
            type="checkbox"
            variant="outline-info"
            checked={facility.includes(idx)}
            value={idx}
            onChange={(e) => handlerFacility(idx)}
          >
            {fac}
          </ToggleButton>
          )}
      </div>
        <Button variant="primary" type="submit">
          Tembahkan
        </Button>
        </Form>
    </div>
  )
}

export default CreateFiend