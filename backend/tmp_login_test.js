import { loginService } from './src/services/auth.service.js';

async function test(){
  const [token, err] = await loginService({ email: 'usuario3.2024@gmail.cl', password: 'user1234' });
  console.log('token len', token ? token.length : null, 'err', err);
}

test();
