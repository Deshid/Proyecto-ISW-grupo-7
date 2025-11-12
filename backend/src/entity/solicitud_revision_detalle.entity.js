"use strict";
import { EntitySchema } from "typeorm";

const SolicitudRevisionDetalleSchema = new EntitySchema({
  name: "SolicitudRevisionDetalle",
  tableName: "solicitud_revision_detalle",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_nota: {
      type: "int",
      nullable: false,
    },
  },
  relations: {
    solicitud_revision: {
      target: "SolicitudRevision",
      type: "many-to-one",
      joinColumn: { name: "id_solicitud_revision" },
      nullable: false,
    },
  },
});

export default SolicitudRevisionDetalleSchema;
