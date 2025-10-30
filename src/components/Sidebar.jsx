import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Sidebar({ session }){
  const [users,setUsers]=useState([]);
  useEffect(()=>{
    let mounted=true;
    const load = async ()=>{
      const { data } = await supabase.from('users').select('id, username, is_verified');
      if(!mounted) return;
      setUsers(data||[]);
    };
    load();
    return ()=> mounted=false;
  },[]);
  const logout = async ()=> await supabase.auth.signOut();
  return (
    <div className="sidebar">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>FlowChat</h3>
        <button onClick={logout} className="btn">Logout</button>
      </div>
      <div style={{marginTop:12}}>
        {users.map(u=>(
          <div key={u.id} className="user-row">
            <div style={{width:36,height:36,borderRadius:18,background:'#1f2937'}}></div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center'}}>
                <strong>{u.username || u.id.slice(0,6)}</strong>
                {u.is_verified && <span className="ver-badge">✔</span>}
              </div>
              <div style={{fontSize:12,color:'#94a3b8'}}>online</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
