import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createMarkerIcon = () => L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = createMarkerIcon();

const EmployeeMap = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const mapRef = useRef(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/employees/realtime/locations?_=${Date.now()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const validEmployees = data.filter(emp =>
        emp?.location?.lat &&
        emp?.location?.lng &&
        !isNaN(parseFloat(emp.location.lat)) &&
        !isNaN(parseFloat(emp.location.lng))
      ).map(emp => ({
        ...emp,
        location: {
          ...emp.location,
          lat: parseFloat(emp.location.lat),
          lng: parseFloat(emp.location.lng),
          lastUpdated: emp.location.lastUpdated ? new Date(emp.location.lastUpdated) : new Date()
        }
      }));

      setEmployees(validEmployees);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateCenter = useCallback(() => {
    if (!employees.length) return [20.5937, 78.9629];

    const validEmployees = employees.filter(emp =>
      emp?.location?.lat &&
      emp?.location?.lng &&
      !isNaN(emp.location.lat) &&
      !isNaN(emp.location.lng)
    );

    if (!validEmployees.length) return [20.5937, 78.9629];

    const lats = validEmployees.map(e => e.location.lat);
    const lngs = validEmployees.map(e => e.location.lng);

    return [
      (Math.max(...lats) + Math.min(...lats)) / 2,
      (Math.max(...lngs) + Math.min(...lngs)) / 2
    ];
  }, [employees]);

  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 3000);
    return () => clearInterval(interval);
  }, [fetchEmployees]);

  if (loading && employees.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 bg-red-50 rounded-lg">
        <p>Error loading employee data: {error}</p>
        <button
          onClick={fetchEmployees}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Employee Locations</h2>
        <div className="flex items-center space-x-4">
          <span className="text-gray-500">{employees.length} employees</span>
          <span className="text-sm text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="h-[70vh] w-full rounded-md overflow-hidden relative">
        <MapContainer
          center={calculateCenter()}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          whenCreated={(map) => { mapRef.current = map }}
          zoomControl={false}
          doubleClickZoom={false}
          closePopupOnClick={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {employees.map(employee => (
            <Marker
              key={`${employee._id}`}
              position={[employee.location.lat, employee.location.lng]}
              eventHandlers={{
                click: () => {
                  if (mapRef.current) {
                    mapRef.current.flyTo(
                      [employee.location.lat, employee.location.lng],
                      15,
                      { duration: 1 }
                    );
                  }
                }
              }}
            >
              <Popup>
                <div className="space-y-1 min-w-[200px]">
                  <h3 className="font-bold text-lg">{employee.name}</h3>
                  <p className="text-gray-600">{employee.position}</p>
                  {employee.location.city && (
                    <p className="text-gray-600">{employee.location.city}</p>
                  )}
                  <div className="border-t border-gray-200 my-1"></div>
                  <p className="text-sm">
                    <span className="font-medium">Coordinates:</span> {employee.location.lat.toFixed(4)}, {employee.location.lng.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Updated: {employee.location.lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default EmployeeMap;