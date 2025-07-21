// Função utilitária para obter o nome do cliente associado a um processo
// Busca pelo campo clientDireitoHubName, senão busca pelo clientDireitoHubId na base de clientes
import { clientService } from '../firebase/firestore';

export async function getProcessClientName(process) {
  if (process.clientDireitoHubName) return process.clientDireitoHubName;
  if (process.clientDireitoHubId) {
    const result = await clientService.getClientById(process.clientDireitoHubId);
    if (result.success && result.data && result.data.name) {
      return result.data.name;
    }
  }
  return process.clientName || process.client || '';
}
