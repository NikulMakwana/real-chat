function OnlineUsers({ users }) {
  return (
    <div style={{
      position: 'fixed',
      right: '20px',
      top: '20px',
      background: '#722F37',
      color: 'white',
      padding: '10px',
      borderRadius: '5px'
    }}>
      <h4>Online ({users.length})</h4>
      <ul>
        {users.map(user => (
          <li key={user}>{user} <span style={{color: '#0f0'}}>•</span></li>
        ))}
      </ul>
    </div>
  );
}