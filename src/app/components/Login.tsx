import React from 'react';

// Definimos los tipos para que no te dé error rojo
interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#f0fdf4' 
    }}>
      <h1 style={{ color: '#166534', fontSize: '3rem' }}>AgroAlert</h1>
      <p style={{ marginBottom: '20px' }}>Estás en la pantalla de ACCESO</p>
      <button 
        onClick={onLogin}
        style={{ 
          padding: '15px 30px', 
          fontSize: '1.2rem',
          backgroundColor: '#22c55e', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          cursor: 'pointer' 
        }}
      >
        ENTRAR AL SISTEMA
      </button>
    </div>
  );
};

export default Login;