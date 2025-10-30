import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

export default function App(){
  const [session, setSession] = useState(null);
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=> setSession(session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e,sess)=> setSession(sess));
    return ()=> sub?.subscription?.unsubscribe?.();
  },[]);
  return (
    <div className="app-root">
      {!session ? <Login /> : (
        <div className="app-shell">
          <Sidebar session={session} />
          <ChatWindow session={session} />
        </div>
      )}
    </div>
  );
}
