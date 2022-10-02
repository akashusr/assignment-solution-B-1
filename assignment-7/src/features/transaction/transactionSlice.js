import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addTransaction,
  deleteTransaction,
  editTransaction,
  getTransactions,
} from './transactionAPI';

const initialState = {
  transactions: [],
  balance: 0,
  totalCount: 1,
  isLoading: false,
  isError: false,
  error: '',
  editing: {},
  modalEdit: false,
};

// async thunks
export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async (
    { currentPage, limit, search, type } = { currentPage: 1, limit: 5 }
  ) => {
    const transactions = await getTransactions({
      currentPage,
      limit,
      search,
      type,
    });
    return transactions;
  }
);

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (data) => {
    const transaction = await addTransaction(data);
    return transaction;
  }
);

export const changeTransaction = createAsyncThunk(
  'transaction/changeTransaction',
  async ({ id, data }) => {
    const transaction = await editTransaction(id, data);
    return transaction;
  }
);

export const removeTransaction = createAsyncThunk(
  'transaction/removeTransaction',
  async (id) => {
    const transaction = await deleteTransaction(id);
    return transaction;
  }
);

// create slice
const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    editActive: (state, action) => {
      state.editing = action.payload;
    },
    editInActive: (state) => {
      state.editing = {};
    },
    setModalEdit: (state) => {
      state.modalEdit = true;
    },
    cancelModalEdit: (state) => {
      state.modalEdit = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.balance = action.payload.balance;
        state.totalCount = Number(action.payload.totalCount);
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.error?.message;
        state.transactions = [];
      })
      .addCase(createTransaction.pending, (state) => {
        state.isError = false;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.transactions.unshift(action.payload.transaction);
        state.balance = action.payload.balance;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.error?.message;
      })
      .addCase(changeTransaction.pending, (state) => {
        state.isError = false;
      })
      .addCase(changeTransaction.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;

        const indexToUpdate = state.transactions.findIndex(
          (t) => t.id === action.payload.transaction.id
        );

        state.transactions[indexToUpdate] = action.payload.transaction;
        state.balance = action.payload.balance;
      })
      .addCase(changeTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.error?.message;
      })
      .addCase(removeTransaction.pending, (state) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(removeTransaction.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;

        state.transactions = state.transactions.filter(
          (t) => t.id !== action.meta.arg
        );
        state.balance = action.payload.balance;
      })
      .addCase(removeTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.error?.message;
      });
  },
});

export default transactionSlice.reducer;
export const { editActive, editInActive, setModalEdit, cancelModalEdit } =
  transactionSlice.actions;
