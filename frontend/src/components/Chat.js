import {
  Modal,
  Row,
  InputGroup,
  FormControl,
  Dropdown,
  Button,
  Badge,
  Form
} from 'react-bootstrap';
import { Icon } from '@iconify/react';
import {useEffect, useState} from 'react';
import Swal from 'sweetalert2';
import { sendPostToken } from './Logic/GetRequest';
import { RECEIVE_MESSAGE, SEND_MESSAGE, READ_MESSAGE, SEEN_MESSAGE } from '../SocketConfig'
import moment from 'moment';

function Chat(props) {
    const [message, setMessage] = useState('');
    const [targetAvatar, setTargetAvatar] = useState('');
    const [targetName, setTargetName] = useState('');
    const [chatread, setChatread] = useState([]);
    const [chatUnread, setChatUnread] = useState([]);
    const [receiveMessage, setReceiveMessage] = useState({});
    const [readEvent, setReadEvent] = useState('');
    const [unSeen, setUnSeen] = useState(false);
    const [idUser, setIdUser] = useState(0);
    const [inbox, setInbox] = useState([]);
    const [target, setTarget] = useState(0);
    const [idInbox, setIdInbox] = useState(0);
    const [token, setToken] = useState('');
    const [sendByEnterKey, setSendByEnterKey] = useState(false)

    useEffect(() => {
        if(props){
            if(props.id && props.token && !idUser && !token){
                setIdUser(props.id);
                setToken(props.token);
                sendPostToken('/inbox', {user:props.id}, props.token)
                .then((data)=>{
                    const formatedInbox = data.map(item=>formatInbox(item, props.id));
                    if(data)setInbox([...formatedInbox]);
                });
                props.socket.on(RECEIVE_MESSAGE,setReceiveMessage);
                props.socket.on(SEEN_MESSAGE,setReadEvent);
            }
        }
    }, [props]);

    useEffect(()=>{
        if(target!==0){
            const minHeight = (props.minHeight) ? props.minHeight : '80vh';
            const chatbox = document.getElementById('chatbox');
            chatbox.style.minHeight = minHeight;
            const heightChat = (chatbox.offsetHeight - (chatbox.children[0].offsetHeight + chatbox.children[2].offsetHeight));
            chatbox.children[1].style.height = heightChat+'px';
            const sidechat = document.getElementById('sidechat');
            sidechat.style.minHeight = minHeight;
            sidechat.children[1].style.height = (sidechat.offsetHeight - sidechat.children[0].offsetHeight)+'px';
        }
    },[target]);

    useEffect(() => {
    if(chatUnread.length>0 || chatread.length>0){
        const chat = document.getElementById('chat');
        setUnSeen(true);
        const read = document.getElementById('read');
        const unread = document.getElementById('unread');
        chat.addEventListener('scroll',()=>{
            if(read && unread && chatUnread.length>0){
                const yScroll = chat.scrollTop+chat.offsetHeight-read.scrollHeight;
                if(yScroll>0 && chatUnread.length>0 && unSeen){
                    setUnSeen(false);
                    messageRead(idInbox, target)
                }
            }
        });
      }
    }, [chatread,chatUnread]);

    useEffect(() => {
        if(Object.keys(receiveMessage).length>0){
            if(receiveMessage.message.from === target){
                setUnSeen(true);
                setChatUnread(unSeenChat=>[...unSeenChat, receiveMessage.message]);
            }
            const newInbox = [...inbox];
            const Idx_change = newInbox.findIndex(item_inbox=>item_inbox.id===receiveMessage.inboxData.id);
            if(Idx_change>0){
                array_move(newInbox, Idx_change, 0);
            }
            const {message,unread, toread, updatedAt} = receiveMessage.inboxData;
            newInbox[0] = {...newInbox[0], message, unread, toread, updatedAt}
            setInbox([...newInbox]);
        }
    }, [receiveMessage])

    useEffect(()=>{
        const [id_inbox, messageChange] = readEvent;
        if(id_inbox === idInbox){
            let mChange = messageChange;
            const addSeen = chatread.map(msg=>{
                if(mChange>0 && !msg.read){
                    mChange--;
                    return{...msg, read:true};
                }else{
                    return{...msg}
                }
            });
            setChatread([...addSeen]);
        }
    },[readEvent]);
    

    const messageRead =(id_inbox, id_target)=>{
        if(inbox.some(data_inbox=>data_inbox.id===id_inbox && data_inbox.toread === idUser)){
            const dataInbox = [...inbox]
            const Idx_change = inbox.findIndex(item_inbox=>item_inbox.id===id_inbox);
            if(Idx_change>=0){
                dataInbox[Idx_change].toread = id_target;
                dataInbox[Idx_change].unread = 0;
            }
            setInbox([...dataInbox]);
            sendPostToken('/chat/read', {idInbox:id_inbox,user:idUser, idTarget:target}, token);
        }
    }
    
    useEffect(() => {
        if(chatread.length>=0){
            const chat = document.getElementById('chat');
            if(chat)chat.scrollTop = chat.scrollHeight;
        }
    }, [chatread])
    
    const formatInbox = (content, id)=>{
        const user = (content.fromChat.user.id!==id) ? content.fromChat.user : content.toChat.user;
        const setContent = {
            ...content,
            user
        }
        delete setContent.fromChat;
        delete setContent.toChat;
        return setContent;
    }

    const array_move = (arr, old_index, new_index)=> {
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    };

    const sendMessageEvent = () =>{
        console.log(chatUnread.length>0);
        const lastIdMsg = (chatUnread.length>0)? chatUnread[chatUnread.length-1].id : (chatread.length>0)? chatread[chatread.length-1].id : 1;
        const dataMessage = {id:lastIdMsg+1,inbox_id:idInbox, from:idUser, read:false, message:message, createdAt:new Date(), updatedAt:new Date()};
        const selectedInbox = inbox.find(data=>data.id===idInbox);
        const unread = (selectedInbox.toread===idUser)? 1: selectedInbox.unread+1;
        const dataInbox = {...selectedInbox, message:message, unread:unread, toread:target};
        const inboxes = [...inbox];
        const Idx_change = inboxes.findIndex(item_inbox=>item_inbox.id===idInbox);
        if(Idx_change>0){
            array_move(inboxes, Idx_change, 0);
        }
        inboxes[0] = dataInbox;
        setInbox([...inboxes]);
        setChatread([...chatread, ...chatUnread, dataMessage]);
        setChatUnread([]);
        setMessage('');
    }

    const submitHandler = (e) =>{
        e.preventDefault();
        if(message){
            sendMessageEvent();
            sendPostToken('/chat/send', {msg:message, from:idUser, to:target, idInbox:idInbox}, token);
        }
    }

    const eventInputMessage = (e) =>{
        setMessage(e.currentTarget.value)
        const row = e.currentTarget.value.split('\n').length;
        if(e.currentTarget.getAttribute("rows") !== row.toString() && row <=5){
            e.currentTarget.setAttribute("rows", row);
        }
    }
    const eventKeyInputMessage = (e) =>{
        if(e.which === 13 && sendByEnterKey){
            submitHandler(e);
        }
    }
    const inboxHandler = (e, data_inbox)=>{
        setTarget(e);
        setIdInbox(data_inbox.id);
        setTargetAvatar(data_inbox.user.avatar);
        setTargetName(data_inbox.user.firstName+" "+data_inbox.user.lastName);
        sendPostToken('/chat',{idInbox:data_inbox.id, idTarget:e}, token)
            .then(data=>{
                messageRead(data_inbox.id, e);
                const filterRead = data.filter(msg=>msg.read || msg.from === idUser);
                setChatread(filterRead);
                const filterUnread = data.filter(msg=>!msg.read && msg.from !== idUser);
                setChatUnread(filterUnread);
                const chat = document.getElementById('chat');
                chat.scrollTop = chat.children[0].scrollHeight;
            })
    }
    
  return (
    <Row className={props.classChat}>
        <div id='sidechat' className='col-5 ps-4 pe-3 border-end'>
            <div className='py-3'>
                <h2>Chat</h2>
                <InputGroup className="mt-3 search-chat">
                <FormControl
                    placeholder="Cari"
                    aria-describedby="basic-addon2"
                    className='border-end-0 none'
                />
                <Button variant="white" className='border border-start-0' id="button-addon2">
                    <Icon icon="bx:search-alt" width={28} className='text-warning' />
                </Button>
                </InputGroup>
            </div>
            <div className='overflow-auto pb-2'>
                {inbox.map(inbx=>
                    <div key={inbx.id} onClick={()=>inboxHandler(inbx.user.id, inbx)} className='pointer px-3 py-2 mx-1 border-0 d-flex align-content-center align-items-center rounded-pill bg-warning no-u'>
                        <img src={inbx.user.avatar} alt="profile" className="rounded-circle" style={{objectFit: "cover"}} width={40} height={40} />
                        <div className='d-inline ms-3 text-white' style={{width:'9rem'}}>
                            <p className="fw-bold mb-0 limit">{inbx.user.firstName} {inbx.user.lastName}</p>
                            <p className="mb-0 limit">{inbx.message}</p>
                        </div>
                        {(inbx.unread >0 && inbx.toread === idUser)?
                        <Badge pill bg="light" text="dark">
                            {inbx.unread}
                        </Badge>
                        :''}
                    </div>
                )}
            </div>
        </div>
        {(target === 0)?
        <div id='chatbox' className='col-7 px-0'></div>
        :
        <div id='chatbox' className='col-7 px-0'>
            <div className='py-3 px-3 border-bottom d-flex justify-content-between'>
                <div className='d-inline-flex align-content-center align-items-center'>
                    {(targetAvatar)?
                    <img src={targetAvatar} alt="profile" className="rounded-circle" style={{objectFit: "cover"}} width={40} height={40} />
                    :''}
                    {(targetName)?
                    <p className="fw-bold d-inline ms-3 mb-0">{targetName}</p>
                    :''}
                </div>
                <div className='d-inline-flex align-content-center align-items-center'>
                    <Dropdown autoClose="outside">
                    <Dropdown.Toggle variant="white" className="p-0" id="dropdown-basic">
                        <Icon icon="carbon:overflow-menu-horizontal" id="dropdown-basic" color="#666" width={32} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="#">Block</Dropdown.Item>
                        <Dropdown.Item href="#">Hapus Semua Obrolan</Dropdown.Item>
                    </Dropdown.Menu>
                    </Dropdown>
                    {(props.onHide) ?
                        <Button variant="white" onClick={props.onHide} className="p-0" ><Icon icon="clarity:window-close-line" color="#666" width={32} /></Button>
                        : ''}
                </div>
            </div>
            <div id='chat' className='d-flex flex-column pb-1 align-items-stretch align-items-end overflow-auto'>
                <div id="read" className='mt-auto'>
                    {chatread.map(msg=>
                        (msg.from === idUser)?
                            <div key={msg.id} className='d-flex w-100 p-1 justify-content-end send-chat'>
                                <p className='align-self-end mb-0 me-1 text-nowrap' style={{fontSize:'.75rem'}}>{(msg.read)?'(Read)':''}{' '}{moment(msg.createdAt).format('HH:mm')}</p>
                                <div className='mb-0 px-3 py-2 bg-warning text-break' style={{whiteSpace: "pre"}}>{msg.message}</div>
                            </div>
                        :
                        <div key={msg.id} className='d-flex w-100 p-1 mt-auto justify-content-start receive-chat'>
                            <div className='mb-0 px-3 py-2 bg-warning text-break' style={{whiteSpace: "pre"}}>{msg.message}</div>
                            <p className='align-self-end mb-0 ms-1 text-nowrap' style={{fontSize:'.75rem'}}>{moment(msg.createdAt).format('HH:mm')}</p>
                        </div>
                    )}
                </div>
                {(chatUnread.length >0)?<p className='mx-auto mb-0 mt-2 border-bottom border-top'>Pesan Baru</p>:'' }
                <div id="unread">
                    {chatUnread.map(msg=>
                        <div key={msg.id} className='d-flex w-100 p-1 mt-auto justify-content-start receive-chat'>
                            <div className='mb-0 px-3 py-2 bg-warning text-break' style={{whiteSpace: "pre"}}>{msg.message}</div>
                            <p className='align-self-end mb-0 ms-1 text-nowrap' style={{fontSize:'.75rem'}}>{moment(msg.createdAt).format('HH:mm')}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className='input-chat w-100 py-3 px-4 bg-warning'>
                <form id="form-message" onSubmit={submitHandler}>
                    <InputGroup className="search-chat">
                        <FormControl
                            as='textarea'
                            id="input-message"
                            placeholder="Cari"
                            style={{resize:'none', verticalAlign:'middle'}}
                            aria-describedby="basic-addon2"
                            className='border-end-0 none'
                            rows="1"
                            value={message}
                            onKeyPress={eventKeyInputMessage}
                            onChange={eventInputMessage}
                            onSubmit={submitHandler}
                        />
                        <Button variant="light" type="submit" className='border border-start-0' id="button-addon2">
                        <Icon icon="mdi:send-circle" color="#f24e1e" width={32} />
                        </Button>
                    </InputGroup>
                </form>
                <Form.Check 
                    type="switch"
                    id="switch"
                    label="Enter to send"
                    checked={sendByEnterKey}
                    onChange={(e)=>setSendByEnterKey(e.currentTarget.checked)}
                />
            </div>
        </div>
        }
    </Row>
  )
}

export default Chat