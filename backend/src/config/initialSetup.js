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
          nombre: "Diego Alexis Salazar Jara",
          email: "administrador2024@gmail.cl",
          password: await encryptPassword("admin1234"),
          rol: "administrador",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombre: "Diego Sebastián Ampuero Belmar",
          email: "usuario1.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "profesor",
        })
      ),

      userRepository.save(
        userRepository.create({
          nombre: "Pedro Luis Hernandez Belmar",
          email: "profesor1.2024@gmail.cl",
          password: await encryptPassword("profesor1234"),
          rol: "profesor",
        })
      ),
        userRepository.save(
          userRepository.create({
            nombre: "Alexander Benjamín Marcelo Carrasco Fuentes",
            email: "usuario2.2024@gmail.cl",
            password: await encryptPassword("user1234"),
            rol: "estudiante",
          }),
      ),
      userRepository.save(
        userRepository.create({
          nombre: "Pablo Andrés Castillo Fernández",
          email: "usuario3.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombre: "Felipe Andrés Henríquez Zapata",
          email: "usuario4.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombre: "Diego Alexis Meza Ortega",
          email: "usuario5.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombre: "Juan Pablo Rosas Martin",
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