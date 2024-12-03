import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Toolbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { ref, onValue, update, set, push, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

// Helper function to convert transport name to valid database key
const toValidKey = (transport) => {
  return transport
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric chars with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
};

const FareDialog = ({ open, onClose, onSubmit, fare = null }) => {
  const isEdit = Boolean(fare);
  const initialValues = {
    transport: fare?.transport || '',
    newMinFare: fare?.newMinFare || '',
    after4km: fare?.after4km || '',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fareData = {
      transport: formData.get('transport'),
      newMinFare: formData.get('newMinFare'),
      after4km: formData.get('after4km'),
    };

    onSubmit(fareData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit Fare' : 'Add New Fare'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="transport"
              label="Transport Type"
              defaultValue={initialValues.transport}
              fullWidth
              required
            />
            <TextField
              name="newMinFare"
              label="New Minimum Fare"
              defaultValue={initialValues.newMinFare}
              fullWidth
              type="number"
              inputProps={{ step: "0.01" }}
            />
            <TextField
              name="after4km"
              label="After 4km Rate"
              defaultValue={initialValues.after4km}
              fullWidth
              type="number"
              inputProps={{ step: "0.01" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save Changes' : 'Add Fare'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const FaresTab = () => {
  const { user } = useAuth();
  const [fares, setFares] = useState([]);
  const [fareDialog, setFareDialog] = useState({ open: false, fare: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, fare: null });

  useEffect(() => {
    const faresRef = ref(database, 'fares');
    const unsubscribe = onValue(faresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const faresList = Object.entries(data).map(([id, fareData]) => ({
          id,
          ...fareData,
        }));
        setFares(faresList);
      } else {
        setFares([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddFare = async (fareData) => {
    try {
      // Check if a fare with this transport type already exists
      const existingFare = fares.find(
        fare => fare.transport.toLowerCase() === fareData.transport.toLowerCase()
      );
      
      if (existingFare) {
        alert('A fare for this transport type already exists. Please use a different name.');
        return;
      }

      // Create a valid database key from the transport name
      const fareKey = toValidKey(fareData.transport);
      
      // Set the fare data at the specific key
      await set(ref(database, `fares/${fareKey}`), fareData);
      setFareDialog({ open: false, fare: null });
    } catch (error) {
      console.error('Error adding fare:', error);
      alert('Failed to add fare');
    }
  };

  const handleEditFare = async (fareData) => {
    try {
      // If transport name hasn't changed, update at the same location
      if (fareData.transport === fareDialog.fare.transport) {
        await update(ref(database, `fares/${fareDialog.fare.id}`), fareData);
      } else {
        // If transport name has changed, check for duplicates
        const existingFare = fares.find(
          fare => 
            fare.transport.toLowerCase() === fareData.transport.toLowerCase() &&
            fare.id !== fareDialog.fare.id
        );
        
        if (existingFare) {
          alert('A fare for this transport type already exists. Please use a different name.');
          return;
        }

        // Remove old entry and add new one with new key
        const newKey = toValidKey(fareData.transport);
        await remove(ref(database, `fares/${fareDialog.fare.id}`));
        await set(ref(database, `fares/${newKey}`), fareData);
      }
      
      setFareDialog({ open: false, fare: null });
    } catch (error) {
      console.error('Error updating fare:', error);
      alert('Failed to update fare');
    }
  };

  const handleDeleteFare = async () => {
    try {
      await remove(ref(database, `fares/${deleteDialog.fare.id}`));
      setDeleteDialog({ open: false, fare: null });
    } catch (error) {
      console.error('Error deleting fare:', error);
      alert('Failed to delete fare');
    }
  };

  return (
    <Box>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFareDialog({ open: true, fare: null })}
          >
            Add Fare
          </Button>
        </Toolbar>
      </Paper>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Transport</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>New Min Fare</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>After 4km</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fares.map((fare) => (
                <TableRow key={fare.id}>
                  <TableCell>{fare.transport}</TableCell>
                  <TableCell>{`₱${fare.newMinFare || '-'}`}</TableCell>
                  <TableCell>{`₱${fare.after4km || '-'}`}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => setFareDialog({ open: true, fare })}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialog({ open: true, fare })}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {fares.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No fares found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <FareDialog
        open={fareDialog.open}
        fare={fareDialog.fare}
        onClose={() => setFareDialog({ open: false, fare: null })}
        onSubmit={fareDialog.fare ? handleEditFare : handleAddFare}
      />

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, fare: null })}>
        <DialogTitle>Delete Fare</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the fare for {deleteDialog.fare?.transport}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, fare: null })}>Cancel</Button>
          <Button onClick={handleDeleteFare} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FaresTab; 