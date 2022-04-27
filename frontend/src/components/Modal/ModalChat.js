import {
  Modal,
} from 'react-bootstrap';
import Chat from '../Chat';

function ModalChat(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      contentClassName="modal-chat"
      >
        <Chat classChat={'mx-0'} onHide={props.onHide} />
    </Modal>
  )
}

export default ModalChat