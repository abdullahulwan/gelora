import {
    ToggleButton,
    InputGroup,
    FormControl,
    Dropdown,
    ButtonToolbar,
    ButtonGroup,
    Button,
} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import { Icon } from '@iconify/react';
import {useState, useEffect} from 'react';
import Select from 'react-select';
import { getData, postData } from './Logic/GetRequest';

function Search(props) {
    const [province, setProvince] = useState(0);
    const [city, setCity] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [minPrice, setMinPrice] = useState(0);
    const [sort, setSort] = useState('Relevansi');
    const [listField, setListField] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [allProvince, setAllProvince] = useState([]);
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

    const handlerCategory = (state, category) =>{
        const categoriesList = [...categories];
        if(state){
            categoriesList.push(category);
        }else{
            const idx = categoriesList.indexOf(category);
            categoriesList.splice(idx,1);
        }
        const body = new FormData();
        categoriesList.forEach(img =>{
            body.append('id', img);
        })
        if(categoriesList.length > 0){
            postData("/list-field/category",body)
                .then(setListField);
        }else{
            getData('/list-field')
            .then(setListField)
        }
        setCategories(categoriesList);
    }

    useEffect(() => {
        getData('/all-categories')
        .then(setAllCategories);
        getData('/getcity').then(cities=>{
            setAllCities(cities.map(e=>{return{value:e.name, label:e.name, id:e.id, province:e.province_id}}))
        });
        getData('/getprovince').then(profinces=>{
            setAllProvince(profinces.map(e=>{return{value:e.name, label:e.name, id:e.id, province:e.province_id}}))
        });
        if(props.keyword){
            console.log(props.keyword);
            if(Object.keys(props.keyword).length>0){
                postData('/field/search',props.keyword).then(setListField);
            }
        }else{
            getData('/list-field').then(setListField);
        }
    }, [props]);

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

  useEffect(() => {
      if(city !== 0 || province !== 0){
          getData(`/list-field/local/${province}/${city}`)
              .then(res=>{
                  if(res){
                      setListField(res);
                  }else{
                      setListField([]);
                  }
                });
      }
  }, [city, province]);

  useEffect(() => {
      if(maxPrice>0 || minPrice>0){
          postData('/list-field/price', {min:minPrice, max:maxPrice}).then(res=>{
                        if(res){
                            setListField(res);
                        }else{
                            setListField([]);
                        }
                      });
      }
  }, [maxPrice, minPrice])
  

    useEffect(()=>{
        const AddId = allCategories.find(item => item.name === props.getCategory);
        if(AddId){
            setCategories([AddId.id]);
        }
    },[props, allCategories]);
  return (
    <div id="search" className="container">
            <h3 className="my-4 fw-bold">Rekomendasi Gedung/Lapang Olaharaga</h3>
            <div className="row">
                <div className="filter mb-5 col-md-3">
                    <h4 className="fw-bold px-3 pt-2 pb-4">Filter</h4>
                    <div className="item-filter">
                        <h5 className="fw-bold px-3 pt-1 pb-2">Kategori</h5>
                        <div className="px-3">
                            {allCategories.map(chooser=>   
                                <ToggleButton
                                    className="mb-2 me-3"
                                    id={chooser.name}
                                    type="checkbox"
                                    variant="outline-primary"
                                    checked={categories.includes(chooser.id)}
                                    value="1"
                                    onChange={(e) => handlerCategory(e.currentTarget.checked, chooser.id)}
                                >
                                    {chooser.name}
                                </ToggleButton>
                            )}
                        </div>
                    </div>
                    <div className="item-filter">
                        <h5 className="fw-bold px-3 pt-1 pb-1">Daerah</h5>
                        <div className="px-4">
                            <p className="fw-bold mb-0">Provinsi</p>
                            <Select
                            noOptionsMessage={()=>"Tidak Temukan"}
                            theme={customTheme}
                            onChange={(e)=>setValue(e,'province')}
                            onInputChange={(e)=>setInput(e,'province')}
                            placeholder='Pilih Provinsi'
                            className='mb-3'
                            options={allProvince}
                            />
                            <p className="fw-bold mb-0 mt-2">Kota/Kabupaten</p>
                            <Select
                            theme={customTheme}
                            noOptionsMessage={()=>"Tidak Temukan"}
                            onChange={(e)=>setValue(e,'city')}
                            onInputChange={(e)=>setInput(e,'city')}
                            placeholder='Pilih Kota/Kabupaten'
                            formatCreateLabel={(s)=>`Membuat Baru ${s}`}
                            options={allCities}
                            />
                        </div>
                    </div>
                    <div className="item-filter border-bottom-0">
                        <h5 className="fw-bold px-3 pt-1 pb-2">Harga</h5>
                        <div className="px-3">
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="maxHarga">Rp</InputGroup.Text>
                                <FormControl
                                placeholder="Harga Maksimal"
                                aria-label="maxPrice"
                                type="number"
                                aria-describedby="maxHarga"
                                value={maxPrice}
                                onChange={(e)=>setMaxPrice(parseInt(e.target.value))}
                                />
                            </InputGroup>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="minHarga">Rp</InputGroup.Text>
                                <FormControl
                                placeholder="Harga Minimal"
                                aria-label="minPrice"
                                type="number"
                                aria-describedby="minHarga"
                                value={minPrice}
                                onChange={(e)=>setMinPrice(parseInt(e.target.value))}
                                />
                            </InputGroup>
                        </div>
                    </div>
                </div>
                <div className="col-md-9">
                    <h5 className="text-end">
                        Urutkan :
                        <Dropdown className="urutan" onSelect={e =>setSort(e)}>
                            <Dropdown.Toggle id="dropdown-autoclose-outside">
                            {sort}
                            </Dropdown.Toggle>

                            <Dropdown.Menu flip={false}>
                                <Dropdown.Item eventKey="Relevansi" active={sort === "Relevansi"}>Relevansi</Dropdown.Item>
                                <Dropdown.Item eventKey="Harga Tertinggi" active={sort === "Harga Tertinggi"}>Harga Tertinggi</Dropdown.Item>
                                <Dropdown.Item eventKey="Harga Terendah" active={sort === "Harga Terendah"}>Harga Terendah</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </h5>
                    <div className="d-flex justify-content-center flex-wrap">
                        {listField.map(field=>
                            <div key={field.id} className="item-lapang d-flex flex-column bd-highligh no-u text-dark">
                                <Link to={`/detail/${field.id}`} className='bd-highlight'>
                                    <img src={field.images[0].source} className="img-item-card" alt={field.name}/>
                                </Link>
                                <div className="p-2 mt-auto bd-highlight">
                                    <Link to={`/detail/${field.id}`} className="no-u text-dark">
                                        <h5 className="fw">{field.name}</h5>
                                    </Link>
                                    <p className="fs-4">Rp. {field.price},-</p>
                                    <div className="d-flex justify-content-between">
                                        <p id="jml-ulasan" className="m-0">Ulasan :</p>
                                        <p id="daerah" className="m-0">{field.city.name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
  )
}

export default Search
