"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    // Check whether the underlying table exists before calling count(). If the
    // table hasn't been created (for example when synchronize/migrations are
    // disabled or permissions are lacking) a SELECT COUNT will fail with
    // Postgres code 42P01 (relation does not exist). Detect that and skip
    // seeding so the app can start; the developer can run migrations later.
    let count;
    try {
      count = await userRepository.count();
    } catch (err) {
      // Postgres 'relation does not exist' error code
      if (err && err.code === "42P01") {
        console.warn("createUsers: tabla 'users' no existe; saltando seed de usuarios.");
        return;
      }
      throw err;
    }
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
          nombre: "Pedro Luis Hernandez Belmar",
          rut: "19.876.543-2",
          nombreCompleto: "Pedro Luis Hernandez Belmar",
          email: "profesor1.2024@gmail.cl",
          password: await encryptPassword("profesor1234"),
          rol: "profesor",
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
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Leonar Andrés Vera Muñoz",
          rut: "21.308.769-5",
          email: "profesor1.2024@gmail.cl",
          password: await encryptPassword("profesor1234"),
          rol: "profesor",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Carlos Alberto Gómez Silva",
          rut: "20.123.456-7",
          email: "profesor2.2024@gmail.cl",
          password: await encryptPassword("profesor1234"),
          rol: "profesor",
        }),
      ),
    ]);
    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}
export {createUsers};