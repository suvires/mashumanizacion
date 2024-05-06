import React from "react";
import PropTypes from "prop-types";
import { formatFirstName } from "../utils/formatUtil";

export default function Finish({ userName, goToScreen }) {
  return (
    <section id="final">
      <h1>Final</h1>
      <p>
        ¡Enahorabuena, {formatFirstName(userName)}! Has completado todos los
        ejercicios sobre humanización en el cuidado de personas.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => {
          goToScreen(-1);
        }}
      >
        Revisar
      </button>
    </section>
  );
}

Finish.propTypes = {
  userName: PropTypes.string.isRequired,
  goToScreen: PropTypes.func.isRequired,
};
