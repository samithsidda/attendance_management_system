import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-main">
        <Navbar />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
