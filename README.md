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
- 4GB RAM disponível
- 10GB espaço em disco

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
- **Base de Dados**: localhost:5432
- **Redis**: localhost:6379

### 4. Credenciais de Teste

```
Email: demo@financeflow.local
Password: demo123
```

## 🗄️ Suporte para MariaDB

A aplicação suporta tanto PostgreSQL como MariaDB:

### Usar MariaDB em vez de PostgreSQL:

```bash
# Iniciar com MariaDB
docker-compose --profile mariadb up -d

# Parar PostgreSQL se estiver a correr
docker-compose stop postgres
```

### Configuração MariaDB:
- **Porta**: 3306
- **Base de Dados**: financeflow
- **Utilizador**: financeflow_user
- **Password**: financeflow_password

### Configuração Automática:

1. **Via Interface Web:**
   - Aceder a Configurações > Base de Dados
   - Selecionar "MariaDB" no dropdown
   - Clicar em "Configurar MariaDB"
   - Seguir o assistente passo-a-passo

2. **Via Docker Compose:**

```bash
# Iniciar MariaDB
docker-compose --profile mariadb up -d

# Parar PostgreSQL (opcional)
docker-compose stop postgres
```

3. **Servidor MariaDB Externo:**
   - Use o assistente de configuração na aplicação
   - Forneça os dados de conexão
   - A aplicação criará automaticamente as tabelas necessárias

### Comandos Úteis MariaDB:

```bash
# Conectar ao MariaDB (Docker)
docker exec -it financeflow-mariadb mysql -u root -p

# Backup MariaDB
docker exec financeflow-mariadb mysqldump -u financeflow_user -p financeflow > backup.sql

# Restaurar MariaDB
docker exec -i financeflow-mariadb mysql -u financeflow_user -p financeflow < backup.sql
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
docker-compose logs postgres
docker-compose logs redis
docker-compose logs financeflow

# Executar comandos na base de dados
docker-compose exec postgres psql -U financeflow_user -d financeflow

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
docker-compose exec postgres psql -U financeflow_user -d financeflow < backups/backup_YYYYMMDD_HHMMSS.sql

# Backup automático (configurado no docker-compose)
# Os backups são criados automaticamente na pasta ./backups
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente Importantes

```bash
# Base de Dados
DATABASE_URL=postgresql://user:password@host:port/database

# Segurança
APP_SECRET=your_super_secret_key
JWT_SECRET=your_jwt_secret

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
  postgres:
    ports:
      - "5433:5432"  # PostgreSQL na porta 5433
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
```

## 📊 Monitorização

### Health Checks

```bash
# Verificar saúde dos serviços
docker-compose ps

# Testar conectividade da base de dados
docker-compose exec postgres pg_isready -U financeflow_user

# Testar Redis
docker-compose exec redis redis-cli ping
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

3. **Base de dados não conecta**
   ```bash
   # Verificar logs
   docker-compose logs postgres
   # Reiniciar serviço
   docker-compose restart postgres
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
- **Mínimo 4GB RAM** para funcionamento estável
- **Backup regular** dos volumes Docker
- **Monitorização** de recursos do sistema

### Escalabilidade

Para ambientes de produção, considere:
- Load balancer para múltiplas instâncias
- Base de dados externa (RDS, etc.)
- CDN para assets estáticos
- Monitorização com Prometheus/Grafana

## 📞 Suporte

Para problemas ou questões:
1. Verificar logs: `docker-compose logs`
2. Consultar documentação Docker
3. Verificar configurações de rede
4. Validar variáveis de ambiente

---

**Nota**: Esta aplicação foi desenvolvida para uso local/privado. Para produção, implemente medidas de segurança adicionais.