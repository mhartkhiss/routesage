import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  TextField,
  Toolbar,
  Chip,
  Stack,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../config/firebase';

const toValidKey = (route) => {
  return route
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const RoutesTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const vehiclesRef = ref(database, 'vehicles');
    const unsubscribe = onValue(vehiclesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vehiclesList = Object.values(data);
        setVehicles(vehiclesList);
        
        // Process and save routes to database
        const groupedRoutes = vehiclesList.reduce((groups, vehicle) => {
          if (vehicle.routes) {
            const routes = vehicle.routes.split(',').map(route => route.trim());
            routes.forEach(route => {
              const routeKey = toValidKey(route);
              if (!groups[routeKey]) {
                groups[routeKey] = {
                  name: route,
                  vehicles: []
                };
              }
              // Check if vehicle is already added to avoid duplicates
              const vehicleExists = groups[routeKey].vehicles.some(
                v => v.vehicleName === vehicle.name
              );
              if (!vehicleExists) {
                groups[routeKey].vehicles.push({
                  vehicleName: vehicle.name,
                  vehicleType: vehicle.type
                });
              }
            });
          }
          return groups;
        }, {});

        // Save to Firebase
        const routesRef = ref(database, 'routes');
        set(routesRef, groupedRoutes);
      } else {
        setVehicles([]);
        // Clear routes if no vehicles
        const routesRef = ref(database, 'routes');
        set(routesRef, null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Get all routes and group them by route name
  const groupedRoutes = vehicles.reduce((groups, vehicle) => {
    if (vehicle.routes) {
      const routes = vehicle.routes.split(',').map(route => route.trim());
      routes.forEach(route => {
        if (!groups[route]) {
          groups[route] = [];
        }
        // Check if vehicle is already added to avoid duplicates
        const vehicleExists = groups[route].some(
          v => v.vehicleName === vehicle.name
        );
        if (!vehicleExists) {
          groups[route].push({
            vehicleName: vehicle.name,
            vehicleType: vehicle.type
          });
        }
      });
    }
    return groups;
  }, {});

  // Convert grouped routes to array format for display
  const allRoutes = Object.entries(groupedRoutes).map(([route, vehicles]) => ({
    route,
    vehicles: vehicles.sort((a, b) => a.vehicleName.localeCompare(b.vehicleName))
  }));

  // Filter routes based on search term
  const filteredRoutes = allRoutes.filter(routeInfo =>
    routeInfo.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
    routeInfo.vehicles.some(vehicle => 
      vehicle.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search routes or vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Toolbar>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Route</TableCell>
                <TableCell>Vehicles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoutes.map((routeInfo) => (
                <TableRow key={routeInfo.route} hover>
                  <TableCell>{routeInfo.route}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {routeInfo.vehicles.map((vehicle, index) => (
                        <Chip
                          key={index}
                          label={`${vehicle.vehicleName} (${vehicle.vehicleType})`}
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRoutes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {allRoutes.length === 0 ? 'No routes found' : 'No matching routes found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default RoutesTab; 