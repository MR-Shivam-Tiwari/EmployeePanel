import React, { useEffect, useState } from 'react';

const Leaves = () => {
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const localData = localStorage.getItem('employeesData');
        
        if (localData) {
          const parsedData = JSON.parse(localData);
          setEmployees(parsedData);
        } else {
          // Fallback to API if no local data
          const response = await fetch('http://localhost:5000/api/employees');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const result = await response.json();
          
          const employeesWithLeaves = result.map(emp => ({
            ...emp,
            leaveDays: emp.leaveDays || 20,  
            leaves: emp.leaves || []  
          }));
          
          setEmployees(employeesWithLeaves);
          localStorage.setItem('employeesData', JSON.stringify(employeesWithLeaves));
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching leave data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLeaveRequestChange = (employeeId, field, value) => {
    setLeaveRequests(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: field === 'days' ? parseInt(value) || 0 : value
      }
    }));
  };

  const approveLeave = async (employeeId) => {
    try {
      const request = leaveRequests[employeeId];
      if (!request || !request.days || request.days <= 0) {
        throw new Error("Please enter valid leave days");
      }

      const employee = employees.find(e => e._id === employeeId);
      if (!employee) throw new Error("Employee not found");

      if (employee.leaveDays < request.days) {
        throw new Error("Not enough available leave days");
      }

      const newLeave = {
        id: Date.now().toString(), 
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + request.days * 24 * 60 * 60 * 1000).toISOString(),
        days: request.days,
        reason: request.reason || '',
        status: 'approved',
        approvedOn: new Date().toISOString()
      };

      const updatedEmployee = {
        ...employee,
        leaveDays: employee.leaveDays - request.days,
        leaves: [...employee.leaves, newLeave]
      };

      const updatedEmployees = employees.map(emp => 
        emp._id === employeeId ? updatedEmployee : emp
      );
      
      setEmployees(updatedEmployees);
      
      localStorage.setItem('employeesData', JSON.stringify(updatedEmployees));
      
      setLeaveRequests(prev => {
        const newRequests = { ...prev };
        delete newRequests[employeeId];
        return newRequests;
      });

      try {
        const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedEmployee),
        });
        
        if (!response.ok) {
          console.error('API update failed, but local changes saved');
        }
      } catch (apiError) {
        console.error('Error updating API:', apiError);
      }

    } catch (error) {
      console.error('Error approving leave:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);  
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Leave Management</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Leaves</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Leave</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map(employee => (
              <tr key={employee._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${employee.leaveDays > 10 ? 'bg-green-100 text-green-800' : employee.leaveDays > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {employee.leaveDays} days
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2 items-center">
                    <input
                      type="number"
                      min="1"
                      max={employee.leaveDays}
                      value={leaveRequests[employee._id]?.days || ''}
                      onChange={(e) => handleLeaveRequestChange(employee._id, 'days', e.target.value)}
                      placeholder="Days"
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={leaveRequests[employee._id]?.reason || ''}
                      onChange={(e) => handleLeaveRequestChange(employee._id, 'reason', e.target.value)}
                      placeholder="Reason"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => approveLeave(employee._id)}
                      className={`px-3 py-1 rounded-md transition duration-200 ${
                        leaveRequests[employee._id]?.days && 
                        leaveRequests[employee._id]?.days > 0 && 
                        employee.leaveDays >= leaveRequests[employee._id]?.days 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Approve
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

export default Leaves;