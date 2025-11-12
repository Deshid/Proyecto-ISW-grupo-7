"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { LugarSchema } from "../entity/lugar.entity.js";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const count = await userRepository.count();
    if (count > 0) return;

    await Promise.all([
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Alexis Salazar Jara",
          rut: "21.308.770-3",
          email: "administrador2024@gmail.cl",
          password: await encryptPassword("admin1234"),
          rol: "administrador",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Sebastián Ampuero Belmar",
          rut: "21.151.897-9",
          email: "usuario1.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        })
      ),
        userRepository.save(
          userRepository.create({
            nombreCompleto: "Alexander Benjamín Marcelo Carrasco Fuentes",
            rut: "20.630.735-8",
            email: "usuario2.2024@gmail.cl",
            password: await encryptPassword("user1234"),
            rol: "estudiante",
          }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Pablo Andrés Castillo Fernández",
          rut: "20.738.450-K",
          email: "usuario3.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Felipe Andrés Henríquez Zapata",
          rut: "20.976.635-3",
          email: "usuario4.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Alexis Meza Ortega",
          rut: "21.172.447-1",
          email: "usuario5.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Juan Pablo Rosas Martin",
          rut: "20.738.415-1",
          email: "usuario6.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
    ]);
    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}
async function createLugares() {
  try {
    const lugarRepository = AppDataSource.getRepository(LugarSchema);
    const count = await lugarRepository.count();
    if (count > 0) return;

    await Promise.all([
      lugarRepository.save(
        lugarRepository.create({
          id_lugar: 1,
          nombre: "Sala de Reuniones A",
          descripcion: "Sala equipada con proyector y pizarra blanca.",
          ubicacion: "Piso 2, Edificio Central",
        })
      ),
      lugarRepository.save(
        lugarRepository.create({
          id_lugar: 2,
          nombre: "Auditorio Principal",
          descripcion: "Auditorio con capacidad para 200 personas.",
          ubicacion: "Piso 1, Edificio de Conferencias",
        })
      ),
      lugarRepository.save(
        lugarRepository.create({
          id_lugar: 3,
          nombre: "Sala B",
          descripcion: "Espacio para reuniones pequeñas.",
          ubicacion: "Piso 3, Edificio Central",
        })
      ),
    ]);
    console.log("* => Lugares creados exitosamente");
  } catch (error) {
    console.error("Error al crear lugares:", error);
  }
}

export { createUsers, createLugares };