import React, { useState, useEffect } from 'react';
import { Database, Server, Shield, Download, Upload, RefreshCw, AlertCircle, CheckCircle, Settings } from 'lucide-react';

export const DatabaseManager = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [dbConfig, setDbConfig] = useState({
    host: 'mariadb',
    port: 3306,
    database: 'financeflow',
    username: 'financeflow_user',
    password: 'financeflow_password'
  });
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
      // Simular verificação de conexão MariaDB
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

  const updateDbConfig = (field: string, value: string | number) => {
    setDbConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Database className="mr-3 text-blue-600" size={32} />
            Gestão da Base de Dados MariaDB
          </h2>
          <p className="text-gray-600">Configuração e monitorização da base de dados MariaDB</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Server className="mr-2" size={20} />
            Estado da Conexão MariaDB
          </h3>
          <button
            onClick={testConnection}
            className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <RefreshCw size={16} className="mr-1" />
            Testar Conexão
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'disconnected' ? 'bg-red-500' :
              'bg-yellow-500 animate-pulse'
            }`} />
            <div>
              <p className="text-sm font-medium text-gray-900">MariaDB</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração MariaDB</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Host da Base de Dados
              </label>
              <input
                type="text"
                value={dbConfig.host}
                onChange={(e) => updateDbConfig('host', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porta
              </label>
              <input
                type="number"
                value={dbConfig.port}
                onChange={(e) => updateDbConfig('port', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Base de Dados
              </label>
              <input
                type="text"
                value={dbConfig.database}
                onChange={(e) => updateDbConfig('database', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={dbConfig.username}
                onChange={(e) => updateDbConfig('username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={dbConfig.password}
                onChange={(e) => updateDbConfig('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Conexão
              </label>
              <input
                type="text"
                value={`mysql://${dbConfig.username}:***@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Configurações Ativas</h4>
              <p className="text-sm text-gray-600">
                Base de dados: MariaDB 11
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={testConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Testar Conexão
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Guardar Configuração
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Docker Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestão Docker</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Comandos Básicos</h4>
            <div className="space-y-2 text-sm">
              <code className="block bg-gray-100 p-2 rounded text-xs">
                docker-compose up -d
              </code>
              <p className="text-gray-600">Iniciar todos os serviços</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">docker-compose down</code>
              <p className="text-gray-600">Parar todos os serviços</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">docker-compose logs -f</code>
              <p className="text-gray-600">Ver logs em tempo real</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">
                docker-compose exec mariadb mysql -u financeflow_user -p financeflow
              </code>
              <p className="text-gray-600">Aceder à base de dados</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Backup & Restore</h4>
            <div className="space-y-2 text-sm">
              <code className="block bg-gray-100 p-2 rounded text-xs">./scripts/backup.sh</code>
              <p className="text-gray-600">Criar backup manual</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">./scripts/restore.sh backup.sql.gz</code>
              <p className="text-gray-600">Restaurar backup</p>
              
              <code className="block bg-gray-100 p-2 rounded text-xs">docker-compose run --rm backup</code>
              <p className="text-gray-600">Backup via Docker</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unraid Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração para Unraid</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Instalação no Unraid</h4>
            <ol className="text-sm text-blue-800 space-y-2 ml-4">
              <li>1. Aceda ao Unraid WebUI → Apps → Community Applications</li>
              <li>2. Procure por "Compose Manager" e instale</li>
              <li>3. Crie uma nova stack com o nome "FinanceFlow"</li>
              <li>4. Cole o conteúdo do docker-compose.yml</li>
              <li>5. Configure as variáveis de ambiente no .env</li>
              <li>6. Inicie a stack</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Caminhos Recomendados no Unraid</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Dados MariaDB:</span>
                <code className="text-green-800">/mnt/user/appdata/financeflow/mariadb</code>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Uploads:</span>
                <code className="text-green-800">/mnt/user/appdata/financeflow/uploads</code>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Backups:</span>
                <code className="text-green-800">/mnt/user/backups/financeflow</code>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Logs:</span>
                <code className="text-green-800">/mnt/user/appdata/financeflow/logs</code>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-3">Configuração de Portas</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-700">Aplicação Web:</span>
                <code className="text-yellow-800">3000:3000</code>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">MariaDB:</span>
                <code className="text-yellow-800">3306:3306</code>
              </div>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              Ajuste as portas conforme necessário para evitar conflitos no Unraid
            </p>
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
              <span className="text-gray-600">MYSQL_DATABASE=</span>
              <span className="text-gray-900">financeflow</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MYSQL_USER=</span>
              <span className="text-gray-900">financeflow_user</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MYSQL_PASSWORD=</span>
              <span className="text-gray-900">***</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MARIADB_PORT=</span>
              <span className="text-gray-900">3306</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">APP_PORT=</span>
              <span className="text-gray-900">3000</span>
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
            <h4 className="font-medium">Reiniciar MariaDB</h4>
            <p className="text-sm text-blue-600">Reiniciar container MariaDB</p>
          </button>
          
          <button className="bg-white text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left">
            <Upload className="w-5 h-5 mb-2" />
            <h4 className="font-medium">Restaurar Backup</h4>
            <p className="text-sm text-blue-600">Restaurar dados anteriores</p>
          </button>
        </div>
      </div>

      {/* Unraid Installation Guide */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guia de Instalação Unraid</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">1. Pré-requisitos</h4>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Unraid 6.10+ com Docker ativado</li>
              <li>• Community Applications plugin instalado</li>
              <li>• Compose Manager plugin instalado</li>
              <li>• 2GB RAM disponível</li>
              <li>• 5GB espaço em disco</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">2. Configuração no Unraid</h4>
            <div className="bg-gray-100 p-3 rounded-lg text-sm">
              <p className="mb-2"><strong>Stack Name:</strong> FinanceFlow</p>
              <p className="mb-2"><strong>Compose File:</strong> Copiar docker-compose.yml</p>
              <p className="mb-2"><strong>Environment File:</strong> Copiar .env.example para .env</p>
              <p><strong>Data Path:</strong> /mnt/user/appdata/financeflow</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">3. Acesso</h4>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Aplicação: <strong>http://[IP-UNRAID]:3000</strong></li>
              <li>• MariaDB: <strong>[IP-UNRAID]:3306</strong></li>
              <li>• Email: <strong>demo@financeflow.local</strong></li>
              <li>• Password: <strong>demo123</strong></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">4. Comandos Úteis Unraid</h4>
            <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono space-y-1">
              <div># Aceder ao container MariaDB</div>
              <div>docker exec -it financeflow_mariadb mysql -u financeflow_user -p</div>
              <div></div>
              <div># Backup manual</div>
              <div>docker exec financeflow_mariadb mysqldump -u financeflow_user -p financeflow {'>'} mnt/user/backups/financeflow/backup.sql</div>
              <div></div>
              <div># Ver logs da aplicação</div>
              <div>docker logs financeflow_app -f</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};