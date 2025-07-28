
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { salesPageService } from '../firebase/salesPageService';
import { productService } from '../firebase/productService';

const AREAS_JURIDICAS = [
  'Direito Civil',
  'Direito Criminal',
  'Direito Trabalhista',
  'Direito Tributário',
  'Direito Empresarial',
  'Direito Administrativo',
  'Direito Constitucional',
  'Direito Previdenciário',
  'Direito do Consumidor',
  'Direito de Família',
  'Direito Sucessório',
  'Direito Imobiliário',
  'Direito Ambiental',
  'Direito Digital',
  'Direito Bancário',
  'Direito Internacional',
  'Direito Médico',
  'Direito Eleitoral',
  'Direito Agrário',
  'Direito da Propriedade Intelectual',
  'Direito Marítimo',
  'Direito Aeronáutico',
  'Direito Desportivo',
  'Direito do Entretenimento',
  'Direito Educacional'
];

const SalesPageBuilder = ({ onBack, onPageCreated, onPageUpdated, editingPage = null }) => {
  const { user } = useAuth();
  const isEditing = !!editingPage;
  // Produtos disponíveis para seleção
  const [availableProducts, setAvailableProducts] = useState([]);
  useEffect(() => {
    async function fetchProducts() {
      if (user?.uid) {
        const result = await productService.getUserProducts(user.uid);
        if (result.success) setAvailableProducts(result.data);
      }
    }
    fetchProducts();
  }, [user]);
  const defaultFormData = {
    tipoPagina: 'vendas',
    nomePagina: '',
    nomeAdvogado: '',
    nomeEscritorio: '',
    cnpj: '',
    oab: '',
    telefone: '',
    email: user?.email || '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    areasAtuacao: [],
    biografia: '',
    experiencia: '',
    formacao: '',
    especialidades: '',
    valorConsulta: {
      minimo: '',
      maximo: ''
    },
    logo: null,
    fotoPerfil: null,
    corTema: '#0ea5e9',
    redesSociais: {
      linkedin: '',
      instagram: '',
      facebook: '',
      whatsapp: ''
    },
    produtosSelecionados: [] // IDs dos produtos selecionados
  };
  const initialFormData = isEditing ? {
    ...defaultFormData,
    ...editingPage,
    agenda: {
      ...defaultAgenda,
      ...(editingPage.agenda || {})
    }
  } : defaultFormData;
  const [formData, setFormData] = useState(initialFormData);
  const [logoPreview, setLogoPreview] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  const handleAreaToggle = (area) => {
    setFormData(prev => ({
      ...prev,
      areasAtuacao: prev.areasAtuacao.includes(area)
        ? prev.areasAtuacao.filter(a => a !== area)
        : [...prev.areasAtuacao, area]
    }));
  };
  const handleFileUpload = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'logo') {
          setLogoPreview(e.target.result);
          setFormData(prev => ({ ...prev, logo: file }));
        } else if (type === 'foto') {
          setFotoPreview(e.target.result);
          setFormData(prev => ({ ...prev, fotoPerfil: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const formatCNPJ = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };
  // ...restante da lógica e JSX igual ao LawyerPageBuilder...
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form>
          {/* ...formulário igual ao LawyerPageBuilder... */}
          <div className="mb-6">
            <label className="block font-medium mb-2">Selecione os produtos para vender:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableProducts.length === 0 ? (
                <span className="text-gray-500">Nenhum produto cadastrado.</span>
              ) : (
                availableProducts.map(prod => (
                  <label key={prod.id} className="flex items-center gap-2 border rounded p-2">
                    <input
                      type="checkbox"
                      checked={formData.produtosSelecionados.includes(prod.id)}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          produtosSelecionados: e.target.checked
                            ? [...prev.produtosSelecionados, prod.id]
                            : prev.produtosSelecionados.filter(id => id !== prod.id)
                        }));
                      }}
                    />
                    <span className="font-semibold">{prod.nome || prod.titulo}</span>
                    <span className="text-gray-500 text-sm">{prod.descricao}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-between mt-6">
            {onBack && (
              <button type="button" onClick={onBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Voltar</button>
            )}
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={isSubmitting}>
              {isEditing ? 'Salvar Alterações' : 'Criar Página de Vendas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesPageBuilder;
