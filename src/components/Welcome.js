import React from "react";
import PropTypes from "prop-types";
import { formatFirstName } from "../utils/formatUtil";

export default function Welcome({ userName, onNextScreen }) {
  return (
    <section id="welcome-page">
      <img
        className="logo"
        src="assets/images/logo.png"
        alt="Logotipo de +Humanización"
      />
      <h1>Humanizar el cuidado</h1>
      <p>¡Hola, {formatFirstName(userName)}!</p>
      <p>
        Te damos la bienvenida a este curso sobre humanización en el cuidado.
      </p>
      <p>
        A continuación verás una serie de vídeos sobre situaciones cotidianas en
        el cuidado.
      </p>
      <p>
        En cada vídeo tendrás que identificar buenas o malas prácticas en el
        cuidado.
      </p>
      <p>¿Serás capaz de encontrarlas?</p>
      <button className="btn btn-primary" onClick={onNextScreen}>
        Empezar
      </button>
    </section>
  );
}

Welcome.propTypes = {
  onNextScreen: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
};
