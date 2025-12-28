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
          nombreCompleto: "Estudiante 1",
          rut: "21.151.897-9",
          email: "estudiante1.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        })
      ),
      userRepository.save(
          userRepository.create({
            nombreCompleto: "Estudiante 2",
            rut: "20.630.735-8",
            email: "estudiante2.2024@gmail.cl",
            password: await encryptPassword("user1234"),
            rol: "estudiante",
          }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 3",
          rut: "20.738.450-K",
          email: "estudiante3.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 4",
          rut: "20.976.635-3",
          email: "estudiante4.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 5",
          rut: "21.172.447-1",
          email: "estudiante5.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 6",
          rut: "20.738.415-1",
          email: "estudiante6.2024@gmail.cl",
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
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 7",
          rut: "19.987.654-3",
          email: "estudiante7.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 8",
          rut: "21.456.789-0",
          email: "estudiante8.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 9",
          rut: "20.654.321-2",
          email: "estudiante9.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      /** agregar 50 estudiantes */
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 10",
          rut: "22.000.001-1",
          email: "estudiante10.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 11",
          rut: "22.000.002-2",
          email: "estudiante11.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 12",
          rut: "22.000.003-3",
          email: "estudiante12.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 13",
          rut: "22.000.004-4",
          email: "estudiante13.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 14",
          rut: "22.000.005-5",
          email: "estudiante14.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 15",
          rut: "22.000.006-6",
          email: "estudiante15.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 16",
          rut: "22.000.007-7",
          email: "estudiante16.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 17",
          rut: "22.000.008-8",
          email: "estudiante17.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 18",
          rut: "22.000.009-9",
          email: "estudiante18.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 19",
          rut: "22.000.010-0",
          email: "estudiante19.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "estudiante",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Estudiante 20",
          rut: "22.000.011-1",
          email: "estudiante20.2024@gmail.cl",
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
          nombre: "Sala A",
          descripcion: "Descripción de la Sala A.",
          ubicacion: "Piso 1",
        })
      ),
      lugarRepository.save(
        lugarRepository.create({
          id_lugar: 2,
          nombre: "Sala B",
          descripcion: "Descripción de la Sala B.",
          ubicacion: "Piso 2",
        })
      ),
      lugarRepository.save(
        lugarRepository.create({
          id_lugar: 3,
          nombre: "Sala C",
          descripcion: "Descripción de la Sala C.",
          ubicacion: "Piso 3",
        })
      ),
    ]);
    console.log("* => Lugares creados exitosamente");
  } catch (error) {
    console.error("Error al crear lugares:", error);
  }
}

export { createUsers, createLugares };
