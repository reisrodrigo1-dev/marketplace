# Correção do Erro "Invalid time value" na Agenda

## 🐛 Problema Identificado

Usuários estavam relatando o erro "**Erro ao gerar evento de agenda: Invalid time value**" ao tentar salvar agendamentos na agenda do dashboard do cliente.

### Causa Raiz

O erro ocorria porque algumas funções não estavam tratando adequadamente diferentes formatos de data vindos do Firestore:

1. **Firestore Timestamps**: Objetos com método `.toDate()`
2. **Strings ISO**: Datas em formato string
3. **Date objects**: Objetos Date JavaScript
4. **Valores nulos/undefined**: Campos não preenchidos

Quando a função `new Date()` recebia valores inválidos, ela retornava `Invalid Date`, causando o erro "Invalid time value" ao tentar converter para ISO string.

## ✅ Solução Implementada

### 1. **Firestore.js - Função `generateCalendarEvent`**

**Antes**:
```javascript
const startDate = new Date(appointment.appointmentDate);
const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
```

**Depois**:
```javascript
// Verificação robusta da data do agendamento
let startDate;
try {
  if (appointment.appointmentDate && typeof appointment.appointmentDate.toDate === 'function') {
    // Se for um Firestore Timestamp
    startDate = appointment.appointmentDate.toDate();
  } else if (appointment.appointmentDate) {
    // Se for uma string ou Date object
    startDate = new Date(appointment.appointmentDate);
  } else {
    throw new Error('Data do agendamento não encontrada');
  }
  
  // Verificar se a data é válida
  if (isNaN(startDate.getTime())) {
    throw new Error('Data do agendamento inválida');
  }
} catch (dateError) {
  console.error('Erro ao processar data do agendamento:', dateError);
  return { success: false, error: 'Data do agendamento inválida ou não encontrada' };
}

const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
```

### 2. **Firestore.js - Função `addToLawyerCalendar`**

Aplicada a mesma correção robusta de tratamento de datas.

### 3. **LawyerAppointments.jsx - Função Auxiliar**

**Adicionada**:
```javascript
const parseAppointmentDate = (appointmentDate) => {
  try {
    if (!appointmentDate) {
      return null;
    }
    
    // Se for um Firestore Timestamp
    if (appointmentDate && typeof appointmentDate.toDate === 'function') {
      return appointmentDate.toDate();
    }
    
    // Se for uma string ou Date object
    const date = new Date(appointmentDate);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      console.error('Data inválida encontrada:', appointmentDate);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Erro ao processar data do agendamento:', error);
    return null;
  }
};
```

**Aplicada em**:
- `applyDateFilter()`
- Filtros de data na grid

### 4. **PaymentModal.jsx - Função de Formatação**

**Adicionada**:
```javascript
const formatAppointmentDate = (appointmentDate) => {
  try {
    if (!appointmentDate) return 'Data não informada';
    
    let date;
    
    // Se for um Firestore Timestamp
    if (appointmentDate && typeof appointmentDate.toDate === 'function') {
      date = appointmentDate.toDate();
    } else {
      // Se for uma string ou Date object
      date = new Date(appointmentDate);
    }
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data do agendamento:', error);
    return 'Data inválida';
  }
};
```

### 5. **LawyerWebPage.jsx - Mapeamento de Slots**

**Corrigido**:
```javascript
const slots = activeAppointments.map(appointment => {
  try {
    let date;
    
    // Se for um Firestore Timestamp
    if (appointment.appointmentDate && typeof appointment.appointmentDate.toDate === 'function') {
      date = appointment.appointmentDate.toDate();
    } else {
      // Se for uma string ou Date object
      date = new Date(appointment.appointmentDate);
    }
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      console.error('Data inválida no agendamento:', appointment.id);
      return null;
    }
    
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().substring(0, 5),
      appointmentId: appointment.id,
      status: appointment.status,
      clientName: appointment.clientName
    };
  } catch (error) {
    console.error('Erro ao processar data do agendamento:', appointment.id, error);
    return null;
  }
}).filter(slot => slot !== null); // Remover slots inválidos
```

## 🎯 Benefícios da Correção

### ✅ **Robustez**
- Tratamento adequado de todos os tipos de data do Firestore
- Validação antes de operações críticas
- Logs de erro informativos para debug

### ✅ **Experiência do Usuário**
- Eliminação do erro "Invalid time value"
- Mensagens de erro mais claras e informativas
- Funcionamento consistente da agenda

### ✅ **Manutenibilidade**
- Funções auxiliares reutilizáveis
- Código mais legível e organizado
- Prevenção de erros similares no futuro

### ✅ **Compatibilidade**
- Suporte a Firestore Timestamps
- Suporte a strings ISO
- Suporte a objetos Date
- Tratamento de valores nulos/undefined

## 📋 Casos de Teste

### ✅ **Teste 1**: Firestore Timestamp
- **Input**: `{ appointmentDate: Timestamp.fromDate(new Date()) }`
- **Resultado**: ✅ Data processada corretamente

### ✅ **Teste 2**: String ISO
- **Input**: `{ appointmentDate: "2025-07-17T14:30:00.000Z" }`
- **Resultado**: ✅ Data processada corretamente

### ✅ **Teste 3**: Date Object
- **Input**: `{ appointmentDate: new Date() }`
- **Resultado**: ✅ Data processada corretamente

### ✅ **Teste 4**: Valor Inválido
- **Input**: `{ appointmentDate: "data-inválida" }`
- **Resultado**: ✅ Erro tratado graciosamente

### ✅ **Teste 5**: Valor Nulo
- **Input**: `{ appointmentDate: null }`
- **Resultado**: ✅ Erro tratado graciosamente

## 🔧 Arquivos Modificados

1. **`src/firebase/firestore.js`**
   - `generateCalendarEvent()` - Linha ~1467
   - `addToLawyerCalendar()` - Linha ~1428

2. **`src/components/LawyerAppointments.jsx`**
   - Função `parseAppointmentDate()` - Nova
   - `applyDateFilter()` - Linha ~70
   - Filtros de data na grid - Linha ~130

3. **`src/components/PaymentModal.jsx`**
   - Função `formatAppointmentDate()` - Nova
   - Formatação de data no modal - Linha ~158

4. **`src/components/LawyerWebPage.jsx`**
   - Mapeamento de slots ocupados - Linha ~39

## 🔍 Próximas Melhorias

### **Validação Adicional**
1. **Schema validation**: Validar formato de data na entrada
2. **Data constraints**: Verificar se datas são futuras quando apropriado
3. **Timezone handling**: Considerar fusos horários explicitamente

### **Monitoramento**
1. **Error tracking**: Implementar rastreamento de erros de data
2. **Analytics**: Monitorar frequência de datas inválidas
3. **Alertas**: Notificar administradores sobre problemas recorrentes

---

**Status**: ✅ Implementado e Funcional  
**Data**: 17 de julho de 2025  
**Impacto**: Correção do erro crítico na funcionalidade de agenda  
**Teste**: Erro "Invalid time value" eliminado em todos os cenários
