"use strict";
import { EntitySchema } from "typeorm";

const PautaSchema = new EntitySchema({
  name: "Pauta",
  tableName: "pautas",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre_pauta: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    fecha_modificacion: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
  relations: {
    profesor_creador: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_profesor_creador" },
      nullable: false,
    },
  },
});

export default PautaSchema;
