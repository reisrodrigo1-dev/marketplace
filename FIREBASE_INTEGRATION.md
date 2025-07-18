# Como Conectar ProcessesScreen com Firebase Real

## Passo 1: Configurar Coleção no Firestore

### Estrutura da Coleção `processes`:
```javascript
// Estrutura de documento em /processes/{processId}
{
  id: "auto-generated-id",
  userId: "uid-do-usuario",
  number: "1234567-89.2024.8.26.0001",
  title: "Ação de Cobrança",
  client: "Maria Silva Santos",
  court: "1ª Vara Cível - SP",
  status: "Em andamento",
  priority: "alta",
  startDate: "2024-01-15",
  lastUpdate: "2024-07-10",
  nextHearing: "2024-08-15",
  description: "Cobrança de honorários advocatícios...",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Passo 2: Atualizar ProcessesScreen.jsx

### Substituir dados fictícios por dados reais:

```javascript
// Remover mockProcesses e substituir useEffect por:
useEffect(() => {
  const loadProcesses = async () => {
    try {
      setLoading(true);
      const userProcesses = await caseService.getUserCases(user.uid);
      setProcesses(userProcesses);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    loadProcesses();
  }
}, [user]);
```

## Passo 3: Implementar funções CRUD reais

### Adicionar processo:
```javascript
const handleAddProcess = async (processData) => {
  try {
    const newProcess = {
      ...processData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const processId = await caseService.createCase(newProcess);
    setProcesses([...processes, { ...newProcess, id: processId }]);
    setShowAddModal(false);
  } catch (error) {
    console.error('Erro ao adicionar processo:', error);
  }
};
```

### Atualizar processo:
```javascript
const handleUpdateProcess = async (processId, updatedData) => {
  try {
    const updateData = {
      ...updatedData,
      updatedAt: new Date()
    };
    
    await caseService.updateCase(processId, updateData);
    setProcesses(processes.map(p => 
      p.id === processId ? { ...p, ...updateData } : p
    ));
    setSelectedProcess(null);
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
  }
};
```

### Excluir processo:
```javascript
const handleDeleteProcess = async (processId) => {
  if (window.confirm('Tem certeza que deseja excluir este processo?')) {
    try {
      await caseService.deleteCase(processId);
      setProcesses(processes.filter(p => p.id !== processId));
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
    }
  }
};
```

## Passo 4: Atualizar firestore.js

### Adicionar métodos específicos para processos:

```javascript
// Adicionar em firestore.js:
export const caseService = {
  // Buscar processos do usuário
  async getUserCases(userId) {
    try {
      const q = query(
        collection(db, 'processes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      throw error;
    }
  },

  // Criar novo processo
  async createCase(caseData) {
    try {
      const docRef = await addDoc(collection(db, 'processes'), caseData);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      throw error;
    }
  },

  // Atualizar processo
  async updateCase(caseId, updateData) {
    try {
      const caseRef = doc(db, 'processes', caseId);
      await updateDoc(caseRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      throw error;
    }
  },

  // Excluir processo
  async deleteCase(caseId) {
    try {
      await deleteDoc(doc(db, 'processes', caseId));
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
      throw error;
    }
  },

  // Buscar processo específico
  async getCase(caseId) {
    try {
      const caseRef = doc(db, 'processes', caseId);
      const caseSnap = await getDoc(caseRef);
      
      if (caseSnap.exists()) {
        return { id: caseSnap.id, ...caseSnap.data() };
      } else {
        throw new Error('Processo não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar processo:', error);
      throw error;
    }
  }
};
```

## Passo 5: Configurar Regras de Segurança no Firestore

### Adicionar no Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para processos
    match /processes/{processId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                   request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == userId;
    }
  }
}
```

## Passo 6: Adicionar Validação de Dados

### Validar dados antes de enviar:

```javascript
const validateProcessData = (data) => {
  const errors = {};
  
  if (!data.number || data.number.trim() === '') {
    errors.number = 'Número do processo é obrigatório';
  }
  
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Título é obrigatório';
  }
  
  if (!data.client || data.client.trim() === '') {
    errors.client = 'Cliente é obrigatório';
  }
  
  if (!data.court || data.court.trim() === '') {
    errors.court = 'Tribunal é obrigatório';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

## Passo 7: Adicionar Loading e Error States

### Melhorar UX com estados de loading:

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Exemplo de uso:
const handleAddProcess = async (processData) => {
  setLoading(true);
  setError(null);
  
  try {
    const validation = validateProcessData(processData);
    
    if (!validation.isValid) {
      setError(validation.errors);
      return;
    }
    
    // ... código para adicionar processo
    
  } catch (error) {
    setError('Erro ao adicionar processo. Tente novamente.');
    console.error('Erro:', error);
  } finally {
    setLoading(false);
  }
};
```

## Passo 8: Testar a Integração

### Checklist de testes:
- [ ] Cadastrar novo processo
- [ ] Listar processos do usuário
- [ ] Editar processo existente
- [ ] Excluir processo
- [ ] Filtrar processos
- [ ] Buscar processos
- [ ] Testar com diferentes usuários
- [ ] Verificar regras de segurança

---

**Importante**: Antes de implementar em produção, certifique-se de:
1. Ter configurado corretamente o Firebase
2. Definir regras de segurança apropriadas
3. Testar todas as funcionalidades
4. Implementar tratamento de erros adequado
5. Considerar backup e recuperação de dados
