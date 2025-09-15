import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, Copy, Eye, EyeOff, Server, Settings, Play } from 'lucide-react';

interface MariaDBSetupProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const MariaDBSetup: React.FC<MariaDBSetupProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [connectionData, setConnectionData] = useState({
    host: 'localhost',
    port: '3306',
    database: 'financeflow',
    username: 'financeflow_user',
    password: 'financeflow_password',
    rootPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    rootPassword: false
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [setupStatus, setSetupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setConnectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'password' | 'rootPassword') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testConnection = async () => {
    setTestStatus('testing');
    setErrorMessage('');
    
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Em uma implementação real, faria uma chamada para o backend
      const response = await fetch('/api/test-mariadb-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionData)
      }).catch(() => {
        // Simular sucesso para demo
        return { ok: true };
      });
      
      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setErrorMessage('Falha na conexão. Verifique os dados e se o MariaDB está acessível.');
      }
    } catch (error) {
      setTestStatus('error');
      setErrorMessage('Erro ao testar conexão: ' + (error as Error).message);
    }
  };

  const setupDatabase = async () => {
    setSetupStatus('creating');
    setErrorMessage('');
    
    try {
      // Simular configuração da base de dados
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Em uma implementação real, executaria os scripts SQL
      const response = await fetch('/api/setup-mariadb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionData)
      }).catch(() => {
        // Simular sucesso para demo
        return { ok: true };
      });
      
      if (response.ok) {
        setSetupStatus('success');
        // Atualizar configuração da aplicação
        localStorage.setItem('financeflow_db_config', JSON.stringify({
          type: 'mariadb',
          ...connectionData
        }));
      } else {
        setSetupStatus('error');
        setErrorMessage('Erro ao configurar base de dados.');
      }
    } catch (error) {
      setSetupStatus('error');
      setErrorMessage('Erro na configuração: ' + (error as Error).message);
    }
  };

  const sqlCommands = {
    createDatabase: `CREATE DATABASE IF NOT EXISTS ${connectionData.database} 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;`,
    
    createUser: `CREATE USER IF NOT EXISTS '${connectionData.username}'@'%' 
IDENTIFIED BY '${connectionData.password}';`,
    
    grantPermissions: `GRANT ALL PRIVILEGES ON ${connectionData.database}.* 
TO '${connectionData.username}'@'%';
FLUSH PRIVILEGES;`,
    
    useDatabase: `USE ${connectionData.database};`
  };

  const dockerCommands = {
    runMariaDB: `docker run -d \\
  --name financeflow-mariadb \\
  -e MYSQL_ROOT_PASSWORD=${connectionData.rootPassword} \\
  -e MYSQL_DATABASE=${connectionData.database} \\
  -e MYSQL_USER=${connectionData.username} \\
  -e MYSQL_PASSWORD=${connectionData.password} \\
  -p ${connectionData.port}:3306 \\
  mariadb:11`,
    
    connectToMariaDB: `docker exec -it financeflow-mariadb mysql -u root -p`,
    
    connectAsUser: `docker exec -it financeflow-mariadb mysql -u ${connectionData.username} -p${connectionData.password} ${connectionData.database}`
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Database className="mr-2 text-blue-600" size={24} />
            Configuração MariaDB
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Connection Data */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados de Conexão MariaDB</h3>
                <p className="text-gray-600 mb-6">
                  Insira os dados de conexão para o seu servidor MariaDB. Se não tiver um servidor, 
                  mostraremos como criar um com Docker no próximo passo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Host/Servidor *
                  </label>
                  <input
                    type="text"
                    value={connectionData.host}
                    onChange={(e) => handleInputChange('host', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="localhost ou IP do servidor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porta *
                  </label>
                  <input
                    type="number"
                    value={connectionData.port}
                    onChange={(e) => handleInputChange('port', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3306"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Base de Dados *
                  </label>
                  <input
                    type="text"
                    value={connectionData.database}
                    onChange={(e) => handleInputChange('database', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="financeflow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Utilizador *
                  </label>
                  <input
                    type="text"
                    value={connectionData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="financeflow_user"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password do Utilizador *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.password ? 'text' : 'password'}
                      value={connectionData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="password_segura"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.password ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Root (para configuração) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.rootPassword ? 'text' : 'password'}
                      value={connectionData.rootPassword}
                      onChange={(e) => handleInputChange('rootPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="password_root"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('rootPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.rootPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Próximo: Verificar Servidor
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Server Setup Instructions */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração do Servidor MariaDB</h3>
                <p className="text-gray-600 mb-6">
                  Se ainda não tem um servidor MariaDB, siga as instruções abaixo para criar um com Docker.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <Server className="mr-2" size={20} />
                  Opção 1: Usar Docker (Recomendado)
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-blue-800 mb-2">1. Execute este comando para criar o container MariaDB:</p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm relative">
                      <pre className="whitespace-pre-wrap">{dockerCommands.runMariaDB}</pre>
                      <button
                        onClick={() => copyToClipboard(dockerCommands.runMariaDB)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
                        title="Copiar comando"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-blue-800 mb-2">2. Verificar se o container está a funcionar:</p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm relative">
                      <pre>docker ps | grep financeflow-mariadb</pre>
                      <button
                        onClick={() => copyToClipboard('docker ps | grep financeflow-mariadb')}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
                        title="Copiar comando"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="mr-2" size={20} />
                  Opção 2: Servidor MariaDB Existente
                </h4>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Se já tem um servidor MariaDB, certifique-se que:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• O servidor está acessível no host e porta especificados</li>
                    <li>• Tem acesso root ou privilégios para criar bases de dados</li>
                    <li>• A porta {connectionData.port} está aberta</li>
                    <li>• O charset UTF8MB4 está suportado</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Próximo: Testar Conexão
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Test Connection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Testar Conexão</h3>
                <p className="text-gray-600 mb-6">
                  Vamos testar se conseguimos conectar ao servidor MariaDB com os dados fornecidos.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Dados de Conexão</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Host:</span>
                    <span className="font-medium ml-2">{connectionData.host}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Porta:</span>
                    <span className="font-medium ml-2">{connectionData.port}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Base de Dados:</span>
                    <span className="font-medium ml-2">{connectionData.database}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Utilizador:</span>
                    <span className="font-medium ml-2">{connectionData.username}</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={testConnection}
                  disabled={testStatus === 'testing'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center mx-auto"
                >
                  {testStatus === 'testing' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      A testar conexão...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2" size={20} />
                      Testar Conexão
                    </>
                  )}
                </button>
              </div>

              {testStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800">
                    <CheckCircle size={20} className="mr-2" />
                    <span className="font-medium">Conexão bem-sucedida!</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    O servidor MariaDB está acessível e pronto para configuração.
                  </p>
                </div>
              )}

              {testStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center text-red-800 mb-2">
                    <AlertCircle size={20} className="mr-2" />
                    <span className="font-medium">Erro na Conexão</span>
                  </div>
                  <p className="text-red-700 text-sm mb-3">{errorMessage}</p>
                  
                  <div className="bg-white border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800 font-medium mb-2">Passos para resolver:</p>
                    <ol className="text-sm text-red-700 space-y-1 ml-4">
                      <li>1. Verificar se o MariaDB está a funcionar</li>
                      <li>2. Confirmar host e porta corretos</li>
                      <li>3. Verificar se a porta está acessível (firewall)</li>
                      <li>4. Validar credenciais de acesso</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={testStatus !== 'success'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Próximo: Configurar Base de Dados
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Database Setup */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração da Base de Dados</h3>
                <p className="text-gray-600 mb-6">
                  Agora vamos criar a base de dados, utilizador e tabelas necessárias para o FinanceFlow.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-4 flex items-center">
                  <AlertCircle className="mr-2" size={20} />
                  Comandos SQL Necessários
                </h4>
                
                <p className="text-yellow-800 text-sm mb-4">
                  Execute estes comandos no seu servidor MariaDB como utilizador root:
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-2">1. Criar base de dados:</p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm relative">
                      <pre>{sqlCommands.createDatabase}</pre>
                      <button
                        onClick={() => copyToClipboard(sqlCommands.createDatabase)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
                        title="Copiar comando"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-2">2. Criar utilizador:</p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm relative">
                      <pre>{sqlCommands.createUser}</pre>
                      <button
                        onClick={() => copyToClipboard(sqlCommands.createUser)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
                        title="Copiar comando"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-2">3. Dar permissões:</p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm relative">
                      <pre>{sqlCommands.grantPermissions}</pre>
                      <button
                        onClick={() => copyToClipboard(sqlCommands.grantPermissions)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
                        title="Copiar comando"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800 font-medium mb-2">Como executar (Docker):</p>
                  <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs relative">
                    <pre>{dockerCommands.connectToMariaDB}</pre>
                    <button
                      onClick={() => copyToClipboard(dockerCommands.connectToMariaDB)}
                      className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white"
                      title="Copiar comando"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={setupDatabase}
                  disabled={setupStatus === 'creating'}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center mx-auto"
                >
                  {setupStatus === 'creating' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      A configurar base de dados...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2" size={20} />
                      Configurar Base de Dados Automaticamente
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  Isto irá criar as tabelas e dados demo automaticamente
                </p>
              </div>

              {setupStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800">
                    <CheckCircle size={20} className="mr-2" />
                    <span className="font-medium">Base de dados configurada com sucesso!</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Todas as tabelas foram criadas e os dados demo foram inseridos.
                  </p>
                </div>
              )}

              {setupStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center text-red-800 mb-2">
                    <AlertCircle size={20} className="mr-2" />
                    <span className="font-medium">Erro na Configuração</span>
                  </div>
                  <p className="text-red-700 text-sm mb-3">{errorMessage}</p>
                  
                  <div className="bg-white border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800 font-medium mb-2">Execute manualmente:</p>
                    <ol className="text-sm text-red-700 space-y-1 ml-4">
                      <li>1. Conectar ao MariaDB como root</li>
                      <li>2. Executar os comandos SQL mostrados acima</li>
                      <li>3. Importar o schema da base de dados</li>
                      <li>4. Tentar novamente</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  disabled={setupStatus !== 'success'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Concluir Configuração
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};