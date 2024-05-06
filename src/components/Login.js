import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { z } from "zod";

const formSchema = z.object({
  userName: z.string().min(3, "Escribe tu nombre"),
  email: z
    .string()
    .email({ message: "El email está mal escrito" })
    .min(1, { message: "Escribe tu email" }),
});

export default function Login({ onLogin }) {
  const formRef = useRef(null);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const values = {
      userName: formData.get("userName"),
      email: formData.get("email"),
    };

    try {
      formSchema.parse(values);
      onLogin(values);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        setErrors(newErrors);
      }
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className={errors.userName ? "error" : ""}>
        <label htmlFor="userName">Nombre</label>
        <input type="text" id="userName" name="userName" />
        {errors.userName && <p className="message">{errors.userName}</p>}
      </div>
      <div className={errors.email ? "error" : ""}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" />
        {errors.email && <p className="message">{errors.email}</p>}
      </div>
      <button type="submit">Enviar</button>
    </form>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};
