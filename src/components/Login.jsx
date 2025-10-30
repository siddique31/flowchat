import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const signIn = async(e)=>{
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if(error) alert(error.message);
  };
  const signUp = async()=>{
    const { error } = await supabase.auth.signUp({ email, password });
    if(error) alert(error.message); else alert('Check your email for confirmation (if enabled).');
  };
  return (
    <div className="card" style={{width:420,padding:24,background:'#0b0712',borderRadius:12}}>
      <h2 style={{margin:0,marginBottom:12}}>FlowChat</h2>
      <form onSubmit={signIn} style={{display:'flex',flexDirection:'column',gap:8}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="input" />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" />
        <div style={{display:'flex',gap:8}}>
          <button className="btn" type="submit">Login</button>
          <button type="button" onClick={signUp} className="btn" style={{background:'#4b5563'}}>Sign up</button>
        </div>
      </form>
    </div>
  );
}
