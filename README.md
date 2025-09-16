# FinanceFlow - Gestão Completa de Finanças Pessoais

Uma aplicação completa para gestão de finanças pessoais com funcionalidades avançadas de análise, orçamentos, investimentos e IA.

## 🚀 Funcionalidades

- **Dashboard Inteligente** - Visão geral completa das finanças
- **Gestão de Transações** - Registo e categorização automática
- **Orçamentos Dinâmicos** - Controlo de gastos por categoria
- **Contas Múltiplas** - Gestão de contas bancárias e cartões
- **Investimentos** - Acompanhamento de portfolio com análise de performance
- **Pagamentos Recorrentes** - Gestão automática com análise de evolução
- **Poupanças por Objetivos** - Metas financeiras com marcos
- **Gestão de Ativos** - Veículos, equipamentos e seguros
- **Relatórios Avançados** - Análises detalhadas e exportação
- **Conselheiro IA** - Recomendações personalizadas
- **Importação/Exportação** - Suporte para múltiplos formatos

## 🐳 Instalação com Docker

### Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM disponível
- 5GB espaço em disco

### 1. Clonar e Configurar

```bash
# Clonar o repositório (ou copiar os ficheiros)
git clone <repository-url>
cd financeflow

# Copiar configuração de ambiente
cp .env.example .env

# Editar variáveis de ambiente (opcional)
nano .env
```

### 2. Construir e Executar

```bash
# Dar permissões aos scripts
chmod +x scripts/*.sh

# Construir e iniciar todos os serviços
./scripts/docker-setup.sh

# OU manualmente:
docker-compose up -d

# Verificar estado dos serviços
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f financeflow
```

### 3. Aceder à Aplicação

- **Aplicação Web**: http://localhost:3000
- **Base de Dados MariaDB**: localhost:3306

### 4. Credenciais de Teste

```
Email: demo@financeflow.local
Password: demo123
```

## 🗄️ Base de Dados MariaDB

A aplicação usa exclusivamente MariaDB como base de dados:

### Configuração MariaDB:
- **Porta**: 3306
- **Base de Dados**: financeflow
- **Utilizador**: financeflow_user
- **Password**: financeflow_password
- **Charset**: UTF8MB4
- **Engine**: InnoDB

### Comandos Úteis MariaDB:

```bash
# Conectar ao MariaDB (Docker)
docker exec -it financeflow_mariadb mysql -u financeflow_user -p

# Backup MariaDB
docker exec financeflow_mariadb mysqldump -u financeflow_user -p financeflow > backup.sql

# Restaurar MariaDB
docker exec -i financeflow_mariadb mysql -u financeflow_user -p financeflow < backup.sql

# Ver logs MariaDB
docker-compose logs mariadb
```

## 🐳 Instalação no Unraid

### Pré-requisitos Unraid

- Unraid 6.10+
- Docker ativado
- Community Applications plugin
- Compose Manager plugin (recomendado)

### 1. Instalação via Compose Manager

```bash
# 1. Aceda ao Unraid WebUI
# 2. Apps → Community Applications
# 3. Procure e instale "Compose Manager"
# 4. Crie nova stack com nome "FinanceFlow"
# 5. Cole o conteúdo do docker-compose.yml
# 6. Configure variáveis de ambiente
# 7. Inicie a stack
```

### 2. Caminhos Recomendados Unraid

```bash
# Dados da aplicação
/mnt/user/appdata/financeflow/

# Estrutura de diretórios:
├── mariadb/          # Dados MariaDB
├── uploads/          # Ficheiros carregados
├── backups/          # Backups automáticos
├── logs/             # Logs da aplicação
└── .env              # Configuração
```

### 3. Configuração de Portas Unraid

```yaml
# Ajustar no docker-compose.yml conforme necessário
ports:
  - "3000:3000"    # Aplicação Web
  - "3306:3306"    # MariaDB (opcional, apenas se precisar de acesso externo)
```

### 4. Variáveis de Ambiente Unraid

```bash
# No ficheiro .env ou interface Unraid
MYSQL_ROOT_PASSWORD=sua_password_root_segura
MYSQL_PASSWORD=sua_password_user_segura
APP_SECRET=sua_chave_secreta_app
JWT_SECRET=sua_chave_jwt_secreta
APP_PORT=3000
MARIADB_PORT=3306

# Caminhos Unraid específicos
UNRAID_APPDATA_PATH=/mnt/user/appdata/financeflow
UNRAID_BACKUP_PATH=/mnt/user/backups/financeflow
```

## 🛠️ Gestão do Docker

### Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Reiniciar apenas a aplicação
docker-compose restart financeflow

# Ver logs de um serviço específico
docker-compose logs mariadb
docker-compose logs financeflow

# Executar comandos na base de dados
docker-compose exec mariadb mysql -u financeflow_user -p financeflow

# Aceder ao container da aplicação
docker-compose exec financeflow sh

# Atualizar a aplicação
docker-compose build financeflow
docker-compose up -d financeflow
```

### Backup e Restauro

```bash
# Criar backup manual
docker-compose run --rm backup

# Restaurar backup
./scripts/restore.sh backup_YYYYMMDD_HHMMSS.sql.gz

# Backup automático (configurado no docker-compose)
# Os backups são criados automaticamente na pasta ./backups
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente Importantes

```bash
# Base de Dados MariaDB
MYSQL_DATABASE=financeflow
MYSQL_USER=financeflow_user
MYSQL_PASSWORD=sua_password_segura
MYSQL_ROOT_PASSWORD=sua_password_root_segura
MARIADB_PORT=3306

# Aplicação
APP_PORT=3000
APP_SECRET=sua_chave_secreta_app
JWT_SECRET=sua_chave_jwt_secreta

# APIs de IA (Opcional)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...

# Configurações de Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=/app/uploads
```

### Personalização do Docker

#### Alterar Portas

```yaml
# No docker-compose.yml
services:
  financeflow:
    ports:
      - "8080:3000"  # Aplicação na porta 8080
  mariadb:
    ports:
      - "3307:3306"  # MariaDB na porta 3307
```

#### Configurar Recursos

```yaml
# No docker-compose.yml
services:
  financeflow:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
  mariadb:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
```

## 📊 Monitorização

### Health Checks

```bash
# Verificar saúde dos serviços
docker-compose ps

# Testar conectividade da base de dados
docker-compose exec mariadb mysqladmin ping -u financeflow_user -p

# Verificar logs
docker-compose logs --tail=100 -f
```

### Logs e Debugging

```bash
# Logs detalhados
docker-compose logs --tail=100 -f

# Logs apenas de erros
docker-compose logs --tail=50 | grep ERROR

# Monitorizar recursos
docker stats
```

## 🔒 Segurança

### Configurações de Produção

1. **Alterar passwords padrão** no `.env`
2. **Configurar HTTPS** com reverse proxy (nginx/traefik)
3. **Restringir acesso** à base de dados
4. **Configurar firewall** adequado
5. **Backups regulares** e testados

### Exemplo de Configuração Nginx

```nginx
server {
    listen 80;
    server_name financeflow.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🆘 Resolução de Problemas

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar processos na porta
   lsof -i :3000
   # Alterar porta no docker-compose.yml
   ```

2. **Erro de permissões**
   ```bash
   # Corrigir permissões
   sudo chown -R $USER:$USER .
   ```

3. **MariaDB não conecta**
   ```bash
   # Verificar logs
   docker-compose logs mariadb
   # Reiniciar serviço
   docker-compose restart mariadb
   ```

4. **Aplicação não inicia**
   ```bash
   # Reconstruir imagem
   docker-compose build --no-cache financeflow
   docker-compose up -d financeflow
   ```

### Reset Completo

```bash
# CUIDADO: Remove todos os dados
docker-compose down -v
docker system prune -a
docker-compose up -d
```

## 📈 Performance

### Otimizações Recomendadas

- **SSD** para volumes da base de dados
- **Mínimo 2GB RAM** para funcionamento estável
- **Backup regular** dos volumes Docker
- **Monitorização** de recursos do sistema

### Escalabilidade

Para ambientes de produção, considere:
- Load balancer para múltiplas instâncias
- MariaDB externa (RDS, etc.)
- CDN para assets estáticos
- Monitorização com Prometheus/Grafana

## 🐳 Unraid Específico

### Configuração Automática

1. **Via Compose Manager:**
   - Aceder a Apps > Compose Manager
   - Criar nova stack "FinanceFlow"
   - Colar docker-compose.yml
   - Configurar variáveis de ambiente
   - Iniciar stack

2. **Caminhos de Dados:**
   ```bash
   # Configurar volumes para persistência
   /mnt/user/appdata/financeflow/mariadb:/var/lib/mysql
   /mnt/user/appdata/financeflow/uploads:/app/uploads
   /mnt/user/backups/financeflow:/backups
   ```

3. **Backup Automático Unraid:**
   - Use o plugin "User Scripts"
   - Configure script para executar ./scripts/backup.sh
   - Agende execução diária

### Comandos Unraid

```bash
# Aceder via terminal Unraid
docker exec -it financeflow_mariadb mysql -u financeflow_user -p

# Backup via Unraid
docker exec financeflow_mariadb mysqldump -u financeflow_user -p financeflow > /mnt/user/backups/financeflow/backup.sql

# Monitorizar no Unraid
docker stats financeflow_app financeflow_mariadb
```

## 📞 Suporte

Para problemas ou questões:
1. Verificar logs: `docker-compose logs`
2. Consultar documentação MariaDB
3. Verificar configurações de rede
4. Validar variáveis de ambiente

### Suporte Unraid

- Verificar plugins necessários instalados
- Confirmar Docker ativado
- Validar caminhos de volumes
- Consultar logs via Unraid WebUI

---

**Nota**: Esta aplicação foi otimizada para MariaDB e funciona perfeitamente no Unraid com Compose Manager.