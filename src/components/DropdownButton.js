import Button from "./Button";

  const DropdownButton = ({ data = [], handleDropdownItemClick, setDropdownOpen, dropdownOpen }) => {
  return (
    <div 
      className="dropdown mr3 mt3 mb3"
      onMouseEnter={() => setDropdownOpen(true)}
      onMouseLeave={() => setDropdownOpen(false)}>
      <Button>
          {"Set tracking speed (s)"}
      </Button>
      { dropdownOpen &&
        <ul className="dropdown-content">
          {data.map((item, i) => (
            <li key={i} onClick={handleDropdownItemClick} value={item}>
              {item}
            </li>
          ))}
        </ul>
      }
    </div>
  );
};

export default DropdownButton;