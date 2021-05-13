import React from "react";

const Button = ({ onClick, onMouseEnter, children, styles }) => {
    let buttonStyles = `f6 no-underline br-pill ph3 pv2 white bg-light-purple ${styles}`;
    return (
      <p
        className={buttonStyles}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        {children}
      </p>
    );
};

export default Button;