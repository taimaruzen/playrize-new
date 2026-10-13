import { useState } from "react";
import { Link } from "react-router-dom";

function Hgbt() {

  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  return (
    <>
    
      <button
        className="hg-but"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          toggleMenu();
        }}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav
        className={`side-menu ${menuOpen ? "open" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <a href="#" className="side-menutitle">Language</a>
      </nav>

    </>
  );
}

export default Hgbt;