import React, { useEffect, useState } from 'react';

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/employees');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setEmployees(result);
        setError(null);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const markAttendance = async (employeeId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          status,
          checkIn: status === 'present' ? new Date().toISOString() : null
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setEmployees(prevEmployees => 
        prevEmployees.map(emp => {
          if (emp._id === employeeId) {
            const newAttendance = {
              date: new Date(date),
              status,
              checkIn: status === 'present' ? new Date() : null,
              checkOut: null
            };
            return {
              ...emp,
              attendance: [...(emp.attendance || []), newAttendance]
            };
          }
          return emp;
        })
      );
    } catch (error) {
      console.error('Error updating attendance:', error);
      setError(error.message);
    }
  };

  const isAttendanceMarked = (employee, dateStr) => {
    if (!employee.attendance || employee.attendance.length === 0) return false;
    const dateObj = new Date(dateStr);
    return employee.attendance.some(record => 
      new Date(record.date).toDateString() === dateObj.toDateString()
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
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
    </div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance Management</h2>
      <div className="mb-6 flex items-center">
        <label className="mr-2 text-gray-700">Select Date: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map(employee => {
              const marked = isAttendanceMarked(employee, date);
              const todayAttendance = employee.attendance?.find(record => 
                new Date(record.date).toDateString() === new Date(date).toDateString()
              );
              
              return (
                <tr key={employee._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {marked ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        todayAttendance.status === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {todayAttendance.status}
                      </span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        className={`px-3 py-1 rounded-md transition duration-200 ${
                          marked && todayAttendance.status === 'present'
                            ? 'bg-green-600 text-white'
                            : marked
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        onClick={() => markAttendance(employee._id, 'present')}
                        disabled={marked}
                      >
                        {marked && todayAttendance.status === 'present' ? 'Present' : 'Mark Present'}
                      </button>
                      <button 
                        className={`px-3 py-1 rounded-md transition duration-200 ${
                          marked && todayAttendance.status === 'absent'
                            ? 'bg-red-600 text-white'
                            : marked
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                        onClick={() => markAttendance(employee._id, 'absent')}
                        disabled={marked}
                      >
                        {marked && todayAttendance.status === 'absent' ? 'Absent' : 'Mark Absent'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;