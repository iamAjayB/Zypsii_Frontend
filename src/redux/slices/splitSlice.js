import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../utils/base_url';

// Async thunks
export const fetchSplitDetails = createAsyncThunk(
  'split/fetchSplitDetails',
  async (splitId) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${base_url}/api/splits/${splitId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
);

export const addExpense = createAsyncThunk(
  'split/addExpense',
  async ({ splitId, expenseData }) => {
    const token = await AsyncStorage.getItem('accessToken');
    const formattedExpenseData = {
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      description: expenseData.description.trim(),
      category: expenseData.category.trim(),
      date: new Date().toISOString(),
      splitId: splitId
    };

    const response = await axios.post(
      `${base_url}/api/splits/${splitId}/expenses`,
      formattedExpenseData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }
);

export const updateExpense = createAsyncThunk(
  'split/updateExpense',
  async ({ splitId, expenseId, newAmount }) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.put(
      `${base_url}/api/splits/${splitId}/expenses/${expenseId}`,
      {
        newAmount: parseFloat(newAmount)
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }
);

export const markAsPaid = createAsyncThunk(
  'split/markAsPaid',
  async ({ splitId, participantId }) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.put(
      `${base_url}/api/splits/${splitId}/participants/paid`,
      { participantId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
);

export const inviteFriend = createAsyncThunk(
  'split/inviteFriend',
  async ({ splitId, email, name }) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(
      `${base_url}/api/splits/${splitId}/invite`,
      { email, name },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }
);

const initialState = {
  currentSplit: null,
  loading: false,
  error: null,
  activeTab: 'expenses',
  isAddParticipantModalVisible: false,
  isAddExpenseModalVisible: false,
  isInviteModalVisible: false,
  editingExpenseId: null,
  editedAmount: '',
};

const splitSlice = createSlice({
  name: 'split',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setAddParticipantModalVisible: (state, action) => {
      state.isAddParticipantModalVisible = action.payload;
    },
    setAddExpenseModalVisible: (state, action) => {
      state.isAddExpenseModalVisible = action.payload;
    },
    setInviteModalVisible: (state, action) => {
      state.isInviteModalVisible = action.payload;
    },
    setEditingExpenseId: (state, action) => {
      state.editingExpenseId = action.payload;
    },
    setEditedAmount: (state, action) => {
      state.editedAmount = action.payload;
    },
    clearSplitState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Split Details
      .addCase(fetchSplitDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSplitDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSplit = action.payload;
      })
      .addCase(fetchSplitDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add Expense
      .addCase(addExpense.fulfilled, (state, action) => {
        state.currentSplit = action.payload;
      })
      // Update Expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.currentSplit = action.payload;
        state.editingExpenseId = null;
        state.editedAmount = '';
      })
      // Mark as Paid
      .addCase(markAsPaid.fulfilled, (state, action) => {
        state.currentSplit = action.payload;
      });
  },
});

export const {
  setActiveTab,
  setAddParticipantModalVisible,
  setAddExpenseModalVisible,
  setInviteModalVisible,
  setEditingExpenseId,
  setEditedAmount,
  clearSplitState,
} = splitSlice.actions;

export default splitSlice.reducer; 