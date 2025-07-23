import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const DebateHistory = () => {
  const [debates, setDebates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const db = getFirestore();

  useEffect(() => {
    const fetchDebates = async () => {
      const snapshot = await getDocs(collection(db, 'legalDebates'));
      const debatesArr = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      debatesArr.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return bDate - aDate;
      });
      setDebates(debatesArr);
    };
    fetchDebates();
  }, [db]);

  const handleEditName = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName || '');
  };

  const handleSaveName = async (id) => {
    await updateDoc(doc(db, 'legalDebates', id), { name: editName });
    setDebates(debates.map(d => d.id === id ? { ...d, name: editName } : d));
    setEditingId(null);
    setEditName('');
  };

  const [openId, setOpenId] = useState(null);
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Histórico de Debates Jurídicos</h1>
      {debates.length === 0 ? (
        <div className="text-gray-500">Nenhum debate salvo.</div>
      ) : (
        <div className="space-y-2">
          {debates.map(debate => (
            <div key={debate.id} className="bg-white rounded shadow p-4 cursor-pointer hover:bg-yellow-50 transition" onClick={() => setOpenId(openId === debate.id ? null : debate.id)}>
              <div className="flex items-center gap-3">
                {editingId === debate.id ? (
                  <>
                    <input
                      className="border rounded px-2 py-1"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Nome do debate"
                    />
                    <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={e => {e.stopPropagation(); handleSaveName(debate.id);}}>Salvar</button>
                    <button className="px-3 py-1 bg-gray-300 rounded" onClick={e => {e.stopPropagation(); setEditingId(null);}}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-lg text-blue-700">{debate.name || 'Sem nome'}</span>
                    <button className="px-2 py-1 bg-yellow-400 text-blue-900 rounded" onClick={e => {e.stopPropagation(); handleEditName(debate.id, debate.name);}}>Editar nome</button>
                  </>
                )}
                <span className="ml-auto text-xs text-gray-500">{debate.createdAt?.toDate ? debate.createdAt.toDate().toLocaleString('pt-BR') : ''}</span>
              </div>
              <div className="text-gray-700 text-sm mt-1">
                <span className="font-semibold">Notícia:</span> {debate.news?.title || ''}
                <span className="ml-4 font-semibold">Lado:</span> {debate.side}
              </div>
              {openId === debate.id && (
                <div className="mt-4">
                  <div className="mb-2 text-gray-700 text-sm">
                    <span className="font-semibold">Resumo do Debate:</span>
                    <ul className="list-disc ml-6">
                      {debate.chat?.map((msg, idx) => (
                        <li key={idx}><span className={msg.sender === 'user' ? 'text-blue-700' : 'text-red-700'}>{msg.sender === 'user' ? 'Você' : 'IA'}:</span> {msg.text}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-2 text-gray-700 text-sm">
                    <span className="font-semibold">Análise/Veredito:</span>
                    <div className="bg-gray-100 p-2 rounded mt-1 whitespace-pre-line">{debate.analysis}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebateHistory;
