import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <nav className="footer">
      <div className="link-section">
        <p>
          <Link to="/nursery">Nursery</Link>
        </p>
        🌼
        <p>
          <Link to="/botany">Create a Species</Link>
        </p>
      </div>
      {/* <p>© 0xEssential 2023</p> */}
    </nav>
  );
};
