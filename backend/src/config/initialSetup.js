"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

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
          password_hash: await encryptPassword("admin1234"),
          rol: "administrador",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombre: "Diego Sebastián Ampuero Belmar",
          email: "usuario1.2024@gmail.cl",
          password_hash: await encryptPassword("user1234"),
          rol: "profesor",
        })
      ),

      userRepository.save(
        userRepository.create({
          nombre: "Pedro Luis Hernandez Belmar",
          email: "profesor1.2024@gmail.cl",
          password_hash: await encryptPassword("profesor1234"),
          rol: "profesor",
        })
      ),
        userRepository.save(
          userRepository.create({
            nombre: "Alexander Benjamín Marcelo Carrasco Fuentes",
            email: "usuario2.2024@gmail.cl",
            password_hash: await encryptPassword("user1234"),
            rol: "estudiante",
          }),
      ),
      userRepository.save(
        userRepository.create({
          nombre: "Pablo Andrés Castillo Fernández",
          email: "usuario3.2024@gmail.cl",
          password_hash: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombre: "Felipe Andrés Henríquez Zapata",
          email: "usuario4.2024@gmail.cl",
          password_hash: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombre: "Diego Alexis Meza Ortega",
          email: "usuario5.2024@gmail.cl",
          password_hash: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombre: "Juan Pablo Rosas Martin",
          email: "usuario6.2024@gmail.cl",
          password_hash: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
    ]);
    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

export { createUsers };