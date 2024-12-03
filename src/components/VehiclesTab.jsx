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
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Toolbar,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  DirectionsBus as BusIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as MotorcycleIcon,
  DirectionsBoat as BoatIcon,
  Train as TrainIcon,
  LocalTaxi as TaxiIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { ref, onValue, push, update, remove, set } from 'firebase/database';
import { database } from '../config/firebase';

const toValidKey = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const formatTypeForDB = (type) => {
  return type.toLowerCase().replace(/\s+/g, '_');
};

const formatTypeForDisplay = (type) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getVehicleIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'bus':
      return <BusIcon sx={{ fontSize: 40 }} />;
    case 'car':
      return <CarIcon sx={{ fontSize: 40 }} />;
    case 'motorcycle':
    case 'tricycle':
      return <MotorcycleIcon sx={{ fontSize: 40 }} />;
    case 'boat':
    case 'ferry':
      return <BoatIcon sx={{ fontSize: 40 }} />;
    case 'train':
      return <TrainIcon sx={{ fontSize: 40 }} />;
    case 'taxi':
      return <TaxiIcon sx={{ fontSize: 40 }} />;
    default:
      return <CarIcon sx={{ fontSize: 40 }} />;
  }
};

const VehicleDialog = ({ open, onClose, onSubmit, vehicle = null, transportTypes }) => {
  const isEdit = Boolean(vehicle);
  const initialValues = {
    name: vehicle?.name || '',
    type: vehicle?.type || '',
    routes: vehicle?.routes || '',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const vehicleData = {
      name: formData.get('name'),
      type: formatTypeForDB(formData.get('type')),
      routes: formData.get('routes'),
    };

    onSubmit(vehicleData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="name"
              label="Vehicle Name"
              defaultValue={initialValues.name}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                name="type"
                label="Vehicle Type"
                defaultValue={initialValues.type}
                disabled={transportTypes.length === 0}
              >
                {transportTypes.length === 0 ? (
                  <MenuItem disabled value="">
                    No transport types available - add fares first
                  </MenuItem>
                ) : (
                  transportTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {formatTypeForDisplay(type)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              name="routes"
              label="Routes"
              defaultValue={initialValues.routes}
              fullWidth
              required
              multiline
              rows={3}
              helperText="Enter routes separated by commas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save Changes' : 'Add Vehicle'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const VehiclesTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleDialog, setVehicleDialog] = useState({ open: false, vehicle: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, vehicle: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [transportTypes, setTransportTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const vehiclesRef = ref(database, 'vehicles');
    const faresRef = ref(database, 'fares');
    
    onValue(faresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const types = Object.values(data).map(fare => fare.transport);
        setTransportTypes(types);
      }
    });

    const unsubscribe = onValue(vehiclesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vehiclesList = Object.entries(data).map(([id, vehicleData]) => ({
          id,
          ...vehicleData
        }));
        setVehicles(vehiclesList);
      } else {
        setVehicles([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddVehicle = async (vehicleData) => {
    try {
      const existingVehicle = vehicles.find(
        vehicle => vehicle.name.toLowerCase() === vehicleData.name.toLowerCase()
      );
      
      if (existingVehicle) {
        alert('A vehicle with this name already exists. Please use a different name.');
        return;
      }

      const vehicleKey = toValidKey(vehicleData.name);
      
      await set(ref(database, `vehicles/${vehicleKey}`), vehicleData);
      setVehicleDialog({ open: false, vehicle: null });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert(error.message);
    }
  };

  const handleEditVehicle = async (vehicleData) => {
    try {
      if (vehicleData.name === vehicleDialog.vehicle.name) {
        await update(ref(database, `vehicles/${vehicleDialog.vehicle.id}`), vehicleData);
      } else {
        const existingVehicle = vehicles.find(
          vehicle => 
            vehicle.name.toLowerCase() === vehicleData.name.toLowerCase() &&
            vehicle.id !== vehicleDialog.vehicle.id
        );
        
        if (existingVehicle) {
          alert('A vehicle with this name already exists. Please use a different name.');
          return;
        }

        const newKey = toValidKey(vehicleData.name);
        await remove(ref(database, `vehicles/${vehicleDialog.vehicle.id}`));
        await set(ref(database, `vehicles/${newKey}`), vehicleData);
      }
      
      setVehicleDialog({ open: false, vehicle: null });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert(error.message);
    }
  };

  const handleDeleteVehicle = async () => {
    try {
      await remove(ref(database, `vehicles/${deleteDialog.vehicle.id}`));
      setDeleteDialog({ open: false, vehicle: null });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert(error.message);
    }
  };

  const groupedVehicles = vehicles.reduce((acc, vehicle) => {
    const type = vehicle.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(vehicle);
    return acc;
  }, {});

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.name?.toLowerCase().includes(searchLower) ||
      vehicle.type?.toLowerCase().includes(searchLower) ||
      vehicle.routes?.toLowerCase().includes(searchLower)
    );
  });

  const renderCategories = () => (
    <Grid container spacing={3}>
      {Object.entries(groupedVehicles).map(([type, vehicles]) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={type}>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardActionArea 
              onClick={() => setSelectedCategory(type)}
              sx={{ height: '100%', p: 2 }}
            >
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 2
              }}>
                {getVehicleIcon(type)}
                <Typography variant="h6" component="div">
                  {formatTypeForDisplay(type)}
                </Typography>
                <Typography color="text.secondary">
                  {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderVehiclesList = () => (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => setSelectedCategory(null)}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="small" />
          Categories
        </Link>
        <Typography color="text.primary">
          {formatTypeForDisplay(selectedCategory)}
        </Typography>
      </Breadcrumbs>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Routes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedVehicles[selectedCategory]?.map((vehicle) => (
              <TableRow key={vehicle.id} hover>
                <TableCell>{vehicle.name}</TableCell>
                <TableCell>{vehicle.routes}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => setVehicleDialog({ open: true, vehicle })}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteDialog({ open: true, vehicle })}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setVehicleDialog({ open: true, vehicle: null })}
          >
            Add Vehicle
          </Button>
          <TextField
            size="small"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Toolbar>
      </Paper>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : vehicles.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center">
          No vehicles found
        </Typography>
      ) : searchTerm ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Routes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} hover>
                  <TableCell>{vehicle.name}</TableCell>
                  <TableCell>{formatTypeForDisplay(vehicle.type)}</TableCell>
                  <TableCell>{vehicle.routes}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => setVehicleDialog({ open: true, vehicle })}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialog({ open: true, vehicle })}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : selectedCategory ? (
        renderVehiclesList()
      ) : (
        renderCategories()
      )}

      <VehicleDialog
        open={vehicleDialog.open}
        vehicle={vehicleDialog.vehicle}
        onClose={() => setVehicleDialog({ open: false, vehicle: null })}
        onSubmit={vehicleDialog.vehicle ? handleEditVehicle : handleAddVehicle}
        transportTypes={transportTypes}
      />

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, vehicle: null })}>
        <DialogTitle>Delete Vehicle</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {deleteDialog.vehicle?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, vehicle: null })}>Cancel</Button>
          <Button onClick={handleDeleteVehicle} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehiclesTab; 