import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';

const ROLES = ['admin', 'user'];

const UserDialog = ({ open, onClose, onSubmit, user = null }) => {
  const isEdit = Boolean(user);
  const initialValues = {
    displayName: user?.displayName || '',
    email: user?.email || '',
    role: user?.role || 'user',
    password: '', // Only for new users
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      displayName: formData.get('displayName'),
      email: formData.get('email'),
      role: formData.get('role'),
    };

    if (!isEdit) {
      userData.password = formData.get('password');
    }

    onSubmit(userData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="displayName"
              label="Display Name"
              defaultValue={initialValues.displayName}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              defaultValue={initialValues.email}
              fullWidth
              required
              disabled={isEdit}
            />
            {!isEdit && (
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                required
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                label="Role"
                defaultValue={initialValues.role}
                required
              >
                {ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserDialog; 