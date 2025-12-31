import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import evaluationService from "../../services/evaluation.service";
import { showAlert } from "../../helpers/sweetAlert";

//Hook para manejar la creación de nuevas pautas
export const useCreatePauta = () => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        nombre_pauta: "",
        items: [{ descripcion: "", puntaje_maximo: "" }],
    });
    const [loading, setLoading] = useState(false);

  // Actualiza el nombre de la pauta

    const handleNombreChange = (e) => {
        setFormData({ ...formData, nombre_pauta: e.target.value });
    };

  //Actualiza un campo específico de un item
    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

  //Agrega un nuevo item vacío
    const addItem = () => {
        setFormData({
        ...formData,
        items: [...formData.items, { descripcion: "", puntaje_maximo: "" }],
        });
    };

  // Elimina un item si hay más de uno

    const removeItem = (index) => {
        if (formData.items.length > 1) {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
        }
    };

    // Maneja el envío del formulario
    // Validación delegada al backend Joi

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
        await evaluationService.createEvaluation(formData, token);
        showAlert("success", "Éxito", "Pauta creada exitosamente");
        
        // Resetear formulario
        setFormData({
            nombre_pauta: "",
            items: [{ descripcion: "", puntaje_maximo: "" }],
        });
        } catch (error) {
        showAlert(
            "error",
            "Error",
            error.message || "No se pudo crear la pauta"
        );
        } finally {
        setLoading(false);
        }
    };

    return {
        // Estados
        formData,
        loading,

        // Handlers
        handleNombreChange,
        handleItemChange,
        addItem,
        removeItem,
        handleSubmit,
    };
};
