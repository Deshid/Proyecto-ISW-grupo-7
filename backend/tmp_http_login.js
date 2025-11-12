import fetch from 'node-fetch';

async function test(){
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'usuario3.2024@gmail.cl', password: 'user1234' })
  });
  const text = await res.text();
  console.log('status', res.status, 'body', text);
}

test().catch(e=>console.error(e));
