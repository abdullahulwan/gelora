import { Icon } from '@iconify/react';

function Footer() {
  return (
    <footer className="bg-primary pt-3">
        <p className="fw-bold text-white text-center">Temukan Kami di :</p>
        <div className="d-flex justify-content-center mb-3">
            <Icon icon="akar-icons:facebook-fill" color="white" className="mx-1" width={24} />
            <Icon icon="akar-icons:instagram-fill" color="white" className="mx-1" width={24} />
            <Icon icon="akar-icons:twitter-fill" color="white" className="mx-1" width={24} />
            <Icon icon="akar-icons:youtube-fill" color="white" className="mx-1" width={24} />
        </div>
        <div className="bg-danger py-1 t-0">
            <p className="text-white text-center">© 2022 Gelora</p>
        </div>
    </footer>
  )
}

export default Footer