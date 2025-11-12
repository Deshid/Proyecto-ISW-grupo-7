import { AppDataSource } from './src/config/configDb.js';
import User from './src/entity/user.entity.js';

async function inspect(){
  try{
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(User);
    const u = await repo.findOne({ where: { email: 'usuario3.2024@gmail.cl' } });
    console.log('user:', u);
    console.log('password_hash type:', typeof u.password_hash);
    console.log('password_hash value:', u.password_hash);
    await AppDataSource.destroy();
  }catch(e){
    console.error(e);
  }
}
inspect();
