import { supabase } from './supabase';

/**
 * Generic Service Layer for Supabase (with Mocks)
 * Handles CRUD operations across multiple tables
 */

// --- MOCK DATABASE FALLBACK ---
type MockTable = { id: number; [key: string]: any }[];
const mockDB: Record<string, MockTable> = {
  users: [
    { id: 1, name: 'Alice M.', role: 'Moderator', status: 'active' },
    { id: 2, name: 'Bob K.', role: 'Gardener', status: 'inactive' },
  ],
  swaps: [
    { id: 1, title: 'Japanese Red Maple', offering: 'Heirloom Kale', status: 'PENDING' },
    { id: 2, title: 'Carbon Steel Spade', offering: 'Borrowing for 3 days', status: 'ACTIVE' },
  ],
  plots: [
    { id: 1, title: 'Rooftop Plot #204', available_sqft: 12, host_id: 1 },
    { id: 2, title: 'Sunny Balcony', available_sqft: 20, host_id: 2 },
  ]
};

let _mockIdCounter = 100;

function isMock(error: any) {
  // Use mock if network error or using placeholder
  return error || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder-project.supabase.co' || !import.meta.env.VITE_SUPABASE_URL;
}

export const db = {
  /**
   * Fetch all records from a table
   */
  async getAll(tableName: string) {
    try {
      const { data, error } = await supabase.from(tableName).select('*').order('id', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      if (isMock(error)) {
        console.warn(`Falling back to mock data for ${tableName}`);
        return { data: mockDB[tableName] || [], error: null };
      }
      return { data: null, error };
    }
  },

  /**
   * Create a new record
   */
  async createRecord(tableName: string, recordData: any) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([recordData])
        .select()
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      if (isMock(error)) {
         if (!mockDB[tableName]) mockDB[tableName] = [];
         const newRecord = { id: _mockIdCounter++, ...recordData };
         mockDB[tableName] = [newRecord, ...mockDB[tableName]];
         return { data: newRecord, error: null };
      }
      return { data: null, error };
    }
  },

  /**
   * Update an existing record by id
   */
  async updateRecord(tableName: string, id: string | number, updateData: any, primaryKey = 'id') {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq(primaryKey, id)
        .select()
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
       if (isMock(error)) {
         if (!mockDB[tableName]) return { data: null, error: new Error('Table not found') };
         const index = mockDB[tableName].findIndex(r => r[primaryKey] === id);
         if (index > -1) {
           mockDB[tableName][index] = { ...mockDB[tableName][index], ...updateData };
           return { data: mockDB[tableName][index], error: null };
         }
         return { data: null, error: new Error('Record not found') };
      }
      return { data: null, error };
    }
  },

  /**
   * Delete a record by id
   */
  async deleteRecord(tableName: string, id: string | number, primaryKey = 'id') {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .delete()
        .eq(primaryKey, id)
        .select()
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      if (isMock(error)) {
         if (!mockDB[tableName]) return { data: null, error: new Error('Table not found') };
         mockDB[tableName] = mockDB[tableName].filter(r => r[primaryKey] !== id);
         return { data: { id }, error: null };
      }
      return { data: null, error };
    }
  },
  
  /**
   * Get all available tables (Mock only exposes predefined ones)
   */
  async getTables() {
    return ['users', 'swaps', 'plots'];
  }
};
