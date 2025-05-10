import { BrowserRouter as Router, Route, Link, Routes, useLocation } from 'react-router-dom';
import { FiMap, FiDollarSign, FiCalendar, FiUserCheck, FiHome } from 'react-icons/fi';
import EmployeeMap from './components/EmployeeMap';
import Payroll from './components/Payroll';
import Attendance from './components/Attendance';
import Leaves from './components/Leaves';

const SidebarLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {children}
    </Link>
  );
};

const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800 px-4">Employee Tracker</h1>
      </div>
      <nav className="space-y-1">
        <SidebarLink to="/" icon={FiHome}>
          Dashboard
        </SidebarLink>
        <SidebarLink to="/" icon={FiMap}>
          Live Locations
        </SidebarLink>
        <SidebarLink to="/attendance" icon={FiUserCheck}>
          Attendance
        </SidebarLink>
        <SidebarLink to="/payroll" icon={FiDollarSign}>
          Payroll
        </SidebarLink>
        <SidebarLink to="/leaves" icon={FiCalendar}>
          Leaves
        </SidebarLink>
      </nav>
    </div>
  );
};

const MobileNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around">
        <Link
          to="/"
          className="flex flex-col items-center p-3 text-xs text-gray-500"
        >
          <FiMap className="w-5 h-5 mb-1" />
          <span>Map</span>
        </Link>
        <Link
          to="/attendance"
          className="flex flex-col items-center p-3 text-xs text-gray-500"
        >
          <FiUserCheck className="w-5 h-5 mb-1" />
          <span>Attendance</span>
        </Link>
        <Link
          to="/payroll"
          className="flex flex-col items-center p-3 text-xs text-gray-500"
        >
          <FiDollarSign className="w-5 h-5 mb-1" />
          <span>Payroll</span>
        </Link>
        <Link
          to="/leaves"
          className="flex flex-col items-center p-3 text-xs text-gray-500"
        >
          <FiCalendar className="w-5 h-5 mb-1" />
          <span>Leaves</span>
        </Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="p-4 md:p-6">
            <Routes>
              <Route path="/" element={<EmployeeMap />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/payroll" element={<Payroll />} />
            </Routes>
          </div>
        </main>
        <MobileNav />
      </div>
    </Router>
  );
}

export default App;