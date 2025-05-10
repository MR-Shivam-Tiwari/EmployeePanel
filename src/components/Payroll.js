import React, { useEffect, useState } from 'react';

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [salaryUpdates, setSalaryUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/employees');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        
        const employeesWithSalary = result.map(emp => ({
          ...emp,
          salary: emp.salary || 0  
        }));
        
        setEmployees(employeesWithSalary);
        setError(null);
      } catch (error) {
        console.error('Error fetching payroll data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSalaryChange = (employeeId, value) => {
    setSalaryUpdates(prev => ({
      ...prev,
      [employeeId]: value
    }));
  };

  const handleSalaryUpdate = async (employeeId) => {
    const newSalary = salaryUpdates[employeeId];
    
  

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salary: Number(newSalary) }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp._id === employeeId 
            ? { ...emp, salary: Number(newSalary) } 
            : emp
        )
      );
      
      setSalaryUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[employeeId];
        return newUpdates;
      });
      
    } catch (error) {
      console.error('Error updating salary:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payroll Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Salary</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map(employee => (
              <tr key={employee._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{(employee.salary || 0).toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="New salary"
                      value={salaryUpdates[employee._id] || ''}
                      onChange={(e) => handleSalaryChange(employee._id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                    />
                    <button
                      onClick={() => handleSalaryUpdate(employee._id)}
                      disabled={!salaryUpdates[employee._id]}
                      className={`px-4 py-1 rounded-md transition duration-200 ${
                        salaryUpdates[employee._id] 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Update
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payroll;