import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Loader2, Plus, Edit2, Trash2, Database, Table as TableIcon } from 'lucide-react';

export default function DataManager() {
  const [tables, setTables] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string>('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editRecordId, setEditRecordId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (activeTable) {
      loadRecords(activeTable);
    }
  }, [activeTable]);

  async function loadTables() {
    setLoading(true);
    const tbls = await db.getTables();
    setTables(tbls);
    if (tbls.length > 0 && !activeTable) {
      setActiveTable(tbls[0]);
    }
    setLoading(false);
  }

  async function loadRecords(table: string) {
    setLoading(true);
    const { data } = await db.getAll(table);
    setRecords(data || []);
    setLoading(false);
  }

  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await db.deleteRecord(activeTable, id);
      loadRecords(activeTable);
    }
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setEditRecordId(record.id);
    setFormData(record);
  };

  const handleCreate = () => {
    setIsEditing(false);
    setEditRecordId(null);
    setFormData({}); // Start empty
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editRecordId !== null) {
       await db.updateRecord(activeTable, editRecordId, formData);
    } else {
       await db.createRecord(activeTable, formData);
    }
    loadRecords(activeTable);
    setFormData({});
    setEditRecordId(null);
  };

  const columns = records.length > 0 ? Object.keys(records[0]) : [];

  return (
    <div className="flex h-full flex-col md:flex-row gap-6 p-4">
      {/* Sidebar: Table List */}
      <div className="md:w-64 glass rounded-3xl p-4 border border-black/10 dark:border-white/10 shrink-0 flex flex-col">
        <h3 className="font-bold flex items-center gap-2 mb-4 text-forest dark:text-moss">
          <Database className="w-4 h-4" /> Tables
        </h3>
        <div className="flex flex-col gap-2">
          {tables.map(t => (
            <button
              key={t}
              onClick={() => setActiveTable(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors text-left ${activeTable === t ? 'bg-forest text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <TableIcon className="w-4 h-4 opacity-50" />
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table Data */}
      <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
        {/* Top bar */}
        <div className="glass px-6 py-4 rounded-3xl flex justify-between items-center border border-black/10 dark:border-white/10 shrink-0">
           <h2 className="font-serif text-2xl font-bold capitalize">{activeTable || 'Select a table'}</h2>
           {activeTable && (
             <button onClick={handleCreate} className="terracotta-btn flex items-center gap-2 shadow-lg">
               <Plus className="w-4 h-4" /> Add Record
             </button>
           )}
        </div>

        {/* Data / Form Area */}
        <div className="flex-1 glass rounded-3xl p-6 overflow-hidden flex flex-col border border-black/10 dark:border-white/10 shadow-sm relative">
           
           {(editRecordId !== null || (Object.keys(formData).length > 0 && !isEditing)) ? (
             <div className="bg-white/50 dark:bg-black/20 p-6 rounded-2xl">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold">{isEditing ? 'Edit Record' : 'Create Record'}</h3>
                 <button onClick={() => { setFormData({}); setEditRecordId(null); }} className="text-xs uppercase tracking-widest opacity-50">Cancel</button>
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-4">
                 {columns.filter(c => c !== 'id').map(col => (
                   <div key={col}>
                      <label className="block text-xs uppercase tracking-widest opacity-60 mb-1">{col}</label>
                      <input 
                        type="text" 
                        value={formData[col] || ''} 
                        onChange={e => setFormData({...formData, [col]: e.target.value})}
                        className="w-full glass bg-white focus:bg-white border-black/10 dark:bg-black/40 px-4 py-2 rounded-xl text-sm"
                      />
                   </div>
                 ))}
                 
                 {columns.length === 0 && (
                   <div>
                     <p className="text-xs opacity-50 mb-2">Since there are no existing records, define JSON pairs manually:</p>
                     <textarea 
                        className="w-full glass bg-white border-black/10 dark:bg-black/40 px-4 py-2 rounded-xl text-sm font-mono"
                        placeholder='{"title": "New", "status": "active"}'
                        onChange={e => {
                          try { setFormData(JSON.parse(e.target.value)) } catch(err){}
                        }}
                        rows={4}
                     />
                   </div>
                 )}

                 <button type="submit" className="terracotta-btn w-full py-3 text-sm mt-4">Save Record</button>
               </form>
             </div>
           ) : (
             <div className="flex-1 overflow-auto custom-scrollbar">
                {loading ? (
                  <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin opacity-50" /></div>
                ) : records.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-50 text-center">
                    <Database className="w-12 h-12 mb-4" />
                    <p>No records found in {activeTable}.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="sticky top-0 bg-white dark:bg-charcoal shadow-sm">
                      <tr>
                        {columns.map(col => (
                          <th key={col} className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest opacity-60">{col}</th>
                        ))}
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {records.map((record, i) => (
                        <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          {columns.map(col => (
                            <td key={col} className="px-4 py-3 opacity-90 truncate max-w-[200px]">
                              {typeof record[col] === 'object' ? JSON.stringify(record[col]) : String(record[col])}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right flex justify-end gap-2">
                             <button onClick={() => handleEdit(record)} className="p-1.5 bg-forest/10 hover:bg-forest/20 text-forest dark:bg-moss/10 dark:text-moss rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={() => handleDelete(record.id)} className="p-1.5 bg-terracotta/10 hover:bg-terracotta/20 text-terracotta rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
