import React, { useState } from 'react';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * LegalDebateModal
 * Modal para simulação de discussão jurídica baseada em uma notícia.
 * Etapas:
 * 1. Exibe resumo da notícia
 * 2. Usuário escolhe defender ou atacar
 * 3. Chat de argumentos (IA assume lado oposto)
 * 4. Análise final da IA
 */
const LegalDebateModal = ({ news, onClose }) => {
  const [step, setStep] = useState(1);
  const [side, setSide] = useState(null); // 'defender' ou 'atacar'
  const [chat, setChat] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState(null);
  const [modalSize, setModalSize] = useState('max-w-3xl p-10');
  const [debateName, setDebateName] = useState('');

  // Handler para escolha de lado
  const handleChooseSide = (chosenSide) => {
    setSide(chosenSide);
    setStep(2);
  };

  // Handler para enviar argumento
  const handleSendArgument = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    const updatedChat = [...chat, { sender: 'user', text: userInput }];
    setChat(updatedChat);
    setUserInput('');
    try {
      // IA deve agir como advogado adversário, justificando e tentando defender/atacar
      const iaRole = side === 'defender' ? 'atacante' : 'defensor';
      const userSide = side === 'defender' ? 'defesa' : 'ataque';
      const iaSide = side === 'defender' ? 'ataque' : 'defesa';
      const prompt = `Você é um advogado que representa o lado ${iaSide} (adversário) em um debate jurídico sobre a seguinte notícia: "${news.title} - ${news.description}". Argumente de forma convincente, sempre pelo lado oposto ao do usuário, justificando sua posição com base em fundamentos jurídicos, leis, precedentes e estratégias reais de advocacia. Rebata os argumentos do usuário, tente convencer o "juiz" e nunca concorde passivamente. Seja combativo, detalhado e estratégico, como em um tribunal. O usuário está representando o lado ${userSide}.`;
      const messages = [
        { role: 'system', content: prompt },
        ...updatedChat.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      ];
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 350
        })
      });
      const data = await response.json();
      const iaText = data.choices?.[0]?.message?.content || 'Erro ao obter resposta da IA.';
      setChat([...updatedChat, { sender: 'ia', text: iaText }]);
    } catch (err) {
      setChat([...updatedChat, { sender: 'ia', text: 'Erro ao obter resposta da IA.' }]);
    }
    setLoading(false);
  };

  function parseAnalysis(text) {
    const strengths = text.match(/Pontos fortes:(.*?)(Pontos fracos:|Sugestões de melhoria:|Veredito:|$)/is)?.[1]?.trim() || '';
    const weaknesses = text.match(/Pontos fracos:(.*?)(Sugestões de melhoria:|Veredito:|$)/is)?.[1]?.trim() || '';
    const suggestions = text.match(/Sugestões de melhoria:(.*?)(Veredito:|$)/is)?.[1]?.trim() || '';
    let verdict = text.match(/Veredito:(.*)$/is)?.[1]?.trim() || '';
    if (!verdict) {
      // Tenta buscar variações
      verdict = text.match(/Veredicto:(.*)$/is)?.[1]?.trim() || '';
    }
    if (!verdict) {
      // Se não encontrar, mostra o texto completo como fallback
      verdict = text;
    }
    return { strengths, weaknesses, suggestions, verdict };
  }

  // Handler para finalizar debate e pedir análise da IA
  const handleFinishDebate = async () => {
    setLoading(true);
    let analysisText = '';
    try {
      const messages = [
        { role: 'system', content: `Você agora é um juiz de tribunal brasileiro. Analise o debate abaixo e forneça:\n- Pontos fortes do usuário\n- Pontos fracos\n- Sugestões de melhoria\n- Veredito final: escreva explicitamente "Veredito: GANHOU" ou "Veredito: PERDEU" e explique o motivo, como em uma sentença real.\nDebate:\n${chat.map(msg => `${msg.sender === 'user' ? 'Usuário' : 'IA'}: ${msg.text}`).join('\n')}` }
      ];
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 400
        })
      });
      const data = await response.json();
      analysisText = data.choices?.[0]?.message?.content || 'Erro ao obter análise da IA.';
      const parsed = parseAnalysis(analysisText);
      setFinalAnalysis(parsed);
      setStep(3);
    } catch (err) {
      setFinalAnalysis({
        strengths: 'Erro ao obter análise.',
        weaknesses: '',
        suggestions: '',
        verdict: ''
      });
      setStep(3);
    }
    // Salvar conversa no Firestore
    try {
      const db = getFirestore();
      await addDoc(collection(db, 'legalDebates'), {
        name: debateName,
        news: news,
        side,
        chat,
        analysis: analysisText,
        createdAt: Timestamp.now()
      });
    } catch (e) {
      // Erro ao salvar, pode logar se quiser
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-screen-xl h-[90vh] p-12 overflow-y-auto relative flex flex-col">
        <button className="absolute top-4 right-6 text-gray-500 text-3xl" onClick={onClose}>×</button>
        {/* Título e nome */}
        {step === 1 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Simulação Jurídica</h2>
            <label className="block mb-2 font-medium text-blue-700">Dê um nome para este debate:</label>
            <input
              className="w-full border rounded px-2 py-1 mb-4"
              type="text"
              value={debateName}
              onChange={e => setDebateName(e.target.value)}
              placeholder="Ex: Debate sobre STF e liberdade de expressão"
            />
            <p className="mb-4 text-gray-700">Resumo da notícia:</p>
            <div className="bg-gray-100 p-3 rounded mb-4 text-sm">{news?.summary || 'Resumo da notícia selecionada.'}</div>
            <p className="mb-2">Você deseja <span className="font-semibold">defender</span> ou <span className="font-semibold">atacar</span> esta situação?</p>
            <div className="flex gap-4 mt-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => handleChooseSide('defender')} disabled={!debateName.trim()}>Defender</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => handleChooseSide('atacar')} disabled={!debateName.trim()}>Atacar</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Discussão Jurídica</h2>
            <div className="mb-2 text-gray-700">Lado escolhido: <span className="font-semibold">{side === 'defender' ? 'Defender' : 'Atacar'}</span></div>
            <div className="border rounded-lg p-4 flex-1 overflow-y-auto bg-gray-50 mb-4" style={{ minHeight: '350px', maxHeight: '50vh' }}>
              {chat.length === 0 && <div className="text-gray-400">Inicie a discussão enviando seu argumento.</div>}
              {chat.map((msg, idx) => (
                <div key={idx} className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-xl max-w-[70%] ${msg.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-yellow-100 text-yellow-900'}`}>
                    <span className="font-semibold mr-2">{msg.sender === 'user' ? 'Você' : 'IA'}:</span> {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-auto">
              <input
                type="text"
                className="flex-1 border rounded-lg px-3 py-2 text-base"
                placeholder="Digite seu argumento..."
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                disabled={loading}
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold" onClick={handleSendArgument} disabled={loading}>Enviar</button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold" onClick={handleFinishDebate} disabled={loading || chat.length === 0}>Finalizar</button>
            </div>
            {loading && <div className="mt-4 text-sm text-gray-500">Processando...</div>}
          </div>
        )}
        {step === 3 && finalAnalysis && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Análise Final da IA</h2>
            <div className="mb-4"><span className="font-semibold">Pontos Fortes:</span> {finalAnalysis.strengths}</div>
            <div className="mb-4"><span className="font-semibold">Pontos Fracos:</span> {finalAnalysis.weaknesses}</div>
            <div className="mb-4"><span className="font-semibold">Sugestões de Melhoria:</span> {finalAnalysis.suggestions}</div>
            <div className="mb-4"><span className="font-semibold">Veredito:</span> <span className="text-lg font-bold text-green-700">{finalAnalysis.verdict}</span></div>
            <button className="mt-6 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold" onClick={onClose}>Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalDebateModal;
