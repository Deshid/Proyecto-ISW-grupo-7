import { useState } from "react";

//Hook para manejar la edición de pautas
export const useEditPauta = (evaluation) => {
    const [nombrePauta, setNombrePauta] = useState(evaluation.nombre_pauta);
    const [items, setItems] = useState(evaluation.items || []);

  // Agrega un nuevo item vacío
    const handleAddItem = () => {
        setItems([...items, { descripcion: "", puntaje_maximo: 1 }]);
    };

  // Elimina un item por índice
    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

  // Actualiza un campo específico de un item
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

  // Actualiza el nombre de la pauta
    const handleNombreChange = (e) => {
        setNombrePauta(e.target.value);
    };

  // Retorna los datos formateados para enviar al backend
    const getFormattedData = () => ({
        nombre_pauta: nombrePauta,
        items: items.map((it) => ({
        descripcion: it.descripcion,
        puntaje_maximo: Number(it.puntaje_maximo),
        })),
    });

    return {
        // Estados
        nombrePauta,
        items,

        // Handlers
        handleNombreChange,
        handleAddItem,
        handleRemoveItem,
        handleItemChange,
        getFormattedData,
    };
};
