import React, { useState, useEffect } from 'react';

export default function AssociateClientModal({ isOpen, onClose, onAssociate, clients }) {
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    if (search.length > 1) {
      setFiltered(clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.email && c.email.toLowerCase().includes(search.toLowerCase()))));
    } else {
      setFiltered([]);
    }
  }, [search, clients]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Associar Cliente ao Processo</h2>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded mb-3"
          placeholder="Buscar cliente por nome ou email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="max-h-48 overflow-y-auto">
          {filtered.length === 0 && search.length > 1 && (
            <div className="text-gray-500 text-sm">Nenhum cliente encontrado.</div>
          )}
          {filtered.map(client => (
            <div key={client.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <div className="font-medium">{client.name}</div>
                <div className="text-xs text-gray-500">{client.email}</div>
              </div>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                onClick={() => onAssociate(client)}
              >
                Associar
              </button>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
