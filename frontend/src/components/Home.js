import { Icon } from '@iconify/react';
import imgHero from '../img/hero.jpg';
import imgCategori from '../img/tembok.jpg';
import Search from './Search';

import {useState, useEffect} from 'react'

function Home() {
    const [category, setCategory] = useState('Semua Kategori');
    const [update, setUpdate] = useState(false);

    useEffect(()=>{
        document.getElementById('hero').style.backgroundImage = `url('${imgHero}')`;
        document.getElementById('category').style.backgroundImage = `url('${imgCategori}')`;
        document.getElementById('hero').style.backgroundSize = "cover";
        document.getElementById('hero').style.backgroundPosition = "0% 40%";
        document.getElementById('category').style.backgroundSize = "cover";
        window.scrollTo(0, 0);
    },[])
    useEffect(()=>{
        setUpdate(!update);
    },[category]);
 
  return (
    <div>
            <div id="hero" className="d-flex align-content-center ps-md-4">
                <div className="container">
                    <h1 className="mb-5 fw-bold text-white">
                        Gelora Membantu Temukan Sewa Lapang Olahraga 
                        Murah Dan Berkualitas serta Fasilitas yang Terbaik.
                    </h1>
                    <a href="#category" className="sticky btn-theme-color px-3 py-2 no-u btn-w btn-s btn-rounded">Segera Pesan !</a>
                </div>
            </div>
            <div id="category" className="d-flex align-content-center pt-5">
                <div className="container h-100">
                    <h1 className="mb-5 mt-5 fw-bold text-white">Pilih Jenis Lapang Olahraga</h1>
                    <div className="d-flex justify-content-evenly mt-4 flex-wrap h-100">
                        <a href='#search' onClick={()=>setCategory("Basket")} className="no-u d-flex justify-content-center flex-column item-category mb-3">
                            <Icon icon="bxs:basketball" width={90} className="d-block m-auto" />
                            <h4 className="fw-bold text-center  mb-3">Basket</h4>
                        </a>
                        <a href='#search' onClick={()=>setCategory("Badminton")} className="no-u d-flex justify-content-center flex-column item-category mb-3">
                            <Icon icon="emojione-monotone:badminton" width={90} className="d-block m-auto" />
                            <h4 className="fw-bold text-center  mb-3">Bulu Tangkis</h4>
                        </a>
                        <a href='#search' onClick={()=>setCategory("Tenis")} className="no-u d-flex justify-content-center flex-column item-category mb-3">
                            <Icon icon="emojione-monotone:tennis" width={90} className="d-block m-auto" />
                            <h4 className="fw-bold text-center  mb-3">Tenis</h4>
                        </a>
                        <a href='#search' onClick={()=>setCategory("Voli")} className="no-u d-flex justify-content-center flex-column item-category mb-3">
                            <Icon icon="fa-solid:volleyball-ball" width={90} className="d-block m-auto" />
                            <h4 className="fw-bold text-center  mb-3">Voli</h4>
                        </a>
                        <a href='#search' onClick={()=>setCategory("Futsal")} className="no-u d-flex justify-content-center flex-column item-category mb-3">
                            <Icon icon="ph:soccer-ball" width={90} className="d-block m-auto"/>
                            <h4 className="fw-bold text-center  mb-3">Futsal</h4>
                        </a>
                    </div>
                </div>
            </div>
            <Search getCategory={category} getUpdate={update}/>
        </div>
  )
}

export default Home