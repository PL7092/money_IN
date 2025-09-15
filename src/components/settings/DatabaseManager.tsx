import React, { useState, useEffect } from 'react';
import { Database, Server, Shield, Download, Upload, RefreshCw, AlertCircle, CheckCircle, Settings } from 'lucide-react';

export const DatabaseManager = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [dbStats, setDbStats] = useState({
    totalTransactions: 0,
    totalAccounts: 0,
    totalUsers: 1,
    dbSize: '0 MB',
    lastBackup: null as string | null
  });
  const [backupStatus, setBackupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');

  useEffect(() => {
    checkConnection();
    loadStats();
  }, []);

  const checkConnection = async () => {
    try {
      // Simular verificação de conexão
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const loadStats = async () => {
    // Simular carregamento de estatísticas
    setDbStats({
      totalTransactions: 1247,
      totalAccounts: 8,
      totalUsers: 1,
      dbSize: '45.2 MB',
      lastBackup: '2024-01-15 14:30:00'
    });
  };

  const createBackup = async () => {
    setBackupStatus('creating');
    try {
      // Simular criação de backup
      await new Promise(resolve => setTimeout(resolve, 3000));
      setBackupStatus('success');
      setDbStats(prev => ({ ...prev, lastBackup: new Date().toLocaleString('pt-PT') }));
    } catch (error) {
      setBackupStatus('error');
    }
  };

  const testConnection = async () => {
    setConnectionStatus('checking');
    await checkConnection();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Database className="mr-3 text-blue-600" size={32} />
            Gestão da Base de Dados
          </h2>
          <p className="text-gray-600">Configuração e monitorização da base de dados PostgreSQL</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Server className="mr-2" size={20} />
            Estado da Conexão
          </h3>
          <button
            onClick={testConnection}
            className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <RefreshCw size={16} className="mr-1" />
            Testar Conexão
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'disconnected' ? 'bg-red-500' :
              'bg-yellow-500 animate-pulse'
            }`} />
            <div>
              <p className="text-sm font-medium text-gray-900">PostgreSQL</p>
              <p className="text-xs text-gray-600">
                {connectionStatus === 'connected' ? 'Conectado' :
                 connectionStatus === 'disconnected' ? 'Desconectado' :
                 'Verificando...'}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Redis</p>
              <p className="text-xs text-gray-600">Conectado</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Docker</p>
              <p className="text-xs text-gray-600">Funcionando</p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas da Base de Dados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-lg p-3 mx-auto w-fit mb-2">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{dbStats.totalTransactions}</p>
            <p className="text-sm text-gray-600">Transações</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-3 mx-auto w-fit mb-2">
              <Server className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{dbStats.totalAccounts}</p>
            <p className="text-sm text-gray-600">Contas</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-lg p-3 mx-auto w-fit mb-2">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{dbStats.totalUsers}</p>
            <p className="text-sm text-gray-600">Utilizadores</p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 rounded-lg p-3 mx-auto w-fit mb-2">
              <Settings className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{dbStats.dbSize}</p>
            <p className="text-sm text-gray-600">Tamanho BD</p>
          </div>
        </div>
      </div>

      {/* Backup Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestão de Backups</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Backup Manual</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Último backup:</span>
                <span className="text-sm font-medium">
                  {dbStats.lastBackup || 'Nunca'}
                </span>
              </div>
              
              <button
                onClick={createBackup}
                disabled={backupStatus === 'creating'}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {backupStatus === 'creating' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando Backup...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Criar Backup Agora
                  </>
                )}
              </button>

              {backupStatus === 'success' && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle size={16} className="mr-2" />
                  Backup criado com sucesso!
                </div>
              )}

              {backupStatus === 'error' && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle size={16} className="mr-2" />
                  Erro ao criar backup
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Backup Automático</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Frequência:</span>
                <span className="text-sm font-medium">Diário às 02:00</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Retenção:</span>
                <span className="text-sm font-medium">30 dias</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                <span className="text-sm font-medium text-green-600 flex items-center">
                  <CheckCircle size={14} className="mr-1" />
                  Ativo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração da Base de Dados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Host da Base de Dados
              </label>
              <input
                type="text"
                value="postgres"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porta
              </label>
              <input
                type="text"
                value="5432"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Base de Dados
              </label>
              <input
                type="text"
                value="financeflow"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utilizador
              </label>
              <input
                type="text"
                value="financeflow_user"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Conexão
              </label>
              <input
                type="text"
                value="postgresql://financeflow_user:***@postgres:5432/financeflow"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Redis Cache
              </label>
              <input
                type="text"
                value="redis://:***@redis:6379"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Docker Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestão Docker</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Comandos Básicos</h4>
            <div className="space-y-2 text-sm">
              <code className="block bg-gray-100 p-2 rounded text-xs">docker-compose up -d</code>
              <p className="text-gray-600">Iniciar todos os serviços</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">docker-compose down</code>
              <p className="text-gray-600">Parar todos os serviços</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">docker-compose logs -f</code>
              <p className="text-gray-600">Ver logs em tempo real</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Backup & Restore</h4>
            <div className="space-y-2 text-sm">
              <code className="block bg-gray-100 p-2 rounded text-xs">./scripts/backup.sh</code>
              <p className="text-gray-600">Criar backup manual</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">./scripts/restore.sh backup.sql.gz</code>
              <p className="text-gray-600">Restaurar backup</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">./scripts/update.sh</code>
              <p className="text-gray-600">Atualizar aplicação</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Monitorização</h4>
            <div className="space-y-2 text-sm">
              <code className="block bg-gray-100 p-2 rounded text-xs">docker-compose ps</code>
              <p className="text-gray-600">Estado dos serviços</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">docker stats</code>
              <p className="text-gray-600">Uso de recursos</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">docker system df</code>
              <p className="text-gray-600">Espaço utilizado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Variáveis de Ambiente</h3>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Configuração Atual (.env)</h4>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-gray-600">DATABASE_URL=</span>
              <span className="text-gray-900">postgresql://financeflow_user:***@localhost:5432/financeflow</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">REDIS_URL=</span>
              <span className="text-gray-900">redis://:***@localhost:6379</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">NODE_ENV=</span>
              <span className="text-gray-900">development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">APP_SECRET=</span>
              <span className="text-gray-900">***</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle size={16} className="text-yellow-600 mr-2" />
            <h4 className="font-medium text-yellow-800">Configuração de Produção</h4>
          </div>
          <p className="text-sm text-yellow-700">
            Para produção, altere as passwords padrão, configure HTTPS e ajuste as configurações de segurança no ficheiro .env
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={createBackup}
            className="bg-white text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left"
          >
            <Download className="w-5 h-5 mb-2" />
            <h4 className="font-medium">Backup Agora</h4>
            <p className="text-sm text-blue-600">Criar backup manual</p>
          </button>
          
          <button className="bg-white text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left">
            <RefreshCw className="w-5 h-5 mb-2" />
            <h4 className="font-medium">Reiniciar Serviços</h4>
            <p className="text-sm text-blue-600">Reiniciar Docker containers</p>
          </button>
          
          <button className="bg-white text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left">
            <Upload className="w-5 h-5 mb-2" />
            <h4 className="font-medium">Restaurar Backup</h4>
            <p className="text-sm text-blue-600">Restaurar dados anteriores</p>
          </button>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instruções de Instalação Docker</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">1. Pré-requisitos</h4>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Docker Engine 20.10+</li>
              <li>• Docker Compose 2.0+</li>
              <li>• 4GB RAM disponível</li>
              <li>• 10GB espaço em disco</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">2. Configuração Inicial</h4>
            <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono">
              <div>chmod +x scripts/*.sh</div>
              <div>./scripts/docker-setup.sh</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">3. Acesso</h4>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Aplicação: <strong>http://localhost:3000</strong></li>
              <li>• Email: <strong>demo@financeflow.local</strong></li>
              <li>• Password: <strong>demo123</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};