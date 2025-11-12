import { AppDataSource } from './src/config/configDb.js';
import User from './src/entity/user.entity.js';
import { encryptPassword } from './src/helpers/bcrypt.helper.js';

const seedPasswords = {
  'administrador2024@gmail.cl': 'admin1234',
  'usuario1.2024@gmail.cl': 'user1234',
  'profesor1.2024@gmail.cl': 'profesor1234',
  'usuario2.2024@gmail.cl': 'user1234',
  'usuario3.2024@gmail.cl': 'user1234',
  'usuario4.2024@gmail.cl': 'user1234',
  'usuario5.2024@gmail.cl': 'user1234',
  'usuario6.2024@gmail.cl': 'user1234',
};

async function backfill(){
  try{
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(User);
    for(const [email, pwd] of Object.entries(seedPasswords)){
      const u = await repo.findOne({ where: { email } });
      if(u){
        if(!u.password){
          const hash = await encryptPassword(pwd);
          u.password = hash;
          await repo.save(u);
          console.log('Backfilled', email);
        } else {
          console.log('Already has password', email);
        }
      } else {
        console.log('User not found', email);
      }
    }
    await AppDataSource.destroy();
    console.log('Done');
  }catch(e){
    console.error(e);
  }
}

backfill();
