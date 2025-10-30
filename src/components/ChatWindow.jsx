import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function ChatWindow({ session }){
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef();

  useEffect(()=>{
    fetchMessages();
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload=>{
        setMessages(prev=>[...prev, payload.new]);
      }).subscribe();
    return ()=> supabase.removeChannel(channel);
  },[]);

  const fetchMessages = async ()=>{
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const send = async (e)=>{
    e.preventDefault();
    if(!text.trim()) return;
    await supabase.from('messages').insert([{ content: text, user_id: session.user.id }]);
    setText('');
  };

  return (
    <div className="chat-area">
      <div className="header">
        <div>Chat</div>
        <div>{session.user.email}</div>
      </div>
      <div className="messages">
        {messages.map(m=>(
          <div key={m.id} style={{alignSelf: m.user_id===session.user.id ? 'flex-end' : 'flex-start', maxWidth:'60%'}}>
            <div style={{padding:10, borderRadius:8, background: m.user_id===session.user.id ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : 'rgba(255,255,255,0.03)'}}>
              {m.content}
            </div>
            <div style={{fontSize:11,color:'#94a3b8',marginTop:4}}>{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <form onSubmit={send} className="composer">
        <input className="input" placeholder="Write a message..." value={text} onChange={e=>setText(e.target.value)} />
        <button className="btn" type="submit">Send</button>
      </form>
    </div>
  );
}
