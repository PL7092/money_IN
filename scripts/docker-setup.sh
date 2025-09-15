#!/bin/bash

# FinanceFlow Docker Setup Script
# Este script automatiza a configuração inicial do Docker

set -e

echo "🚀 FinanceFlow - Configuração Docker"
echo "===================================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    echo "   Visite: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose."
    echo "   Visite: https://docs.docker.com/compose/install/"
    exit 1
fi

# Verificar se Docker está a correr
if ! docker info &> /dev/null; then
    echo "❌ Docker não está a correr. Por favor, inicie o Docker."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Criar diretórios necessários
echo "📁 Criando diretórios necessários..."
mkdir -p backups
mkdir -p uploads
mkdir -p logs

# Configurar permissões
chmod 755 backups uploads logs

# Copiar ficheiro de ambiente se não existir
if [ ! -f .env ]; then
    echo "📝 Criando ficheiro .env..."
    cp .env.example .env
    echo "⚠️  Por favor, edite o ficheiro .env com as suas configurações"
else
    echo "✅ Ficheiro .env já existe"
fi

# Verificar portas disponíveis
echo "🔍 Verificando portas disponíveis..."

check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Porta $port ($service) já está em uso"
        return 1
    else
        echo "✅ Porta $port ($service) disponível"
        return 0
    fi
}

check_port 3000 "FinanceFlow App"
check_port 5432 "PostgreSQL"
check_port 6379 "Redis"

# Construir e iniciar serviços
echo ""
echo "🏗️  Construindo e iniciando serviços..."
echo "   Isto pode demorar alguns minutos na primeira vez..."

# Construir imagens
docker-compose build

# Iniciar serviços em background
docker-compose up -d

# Aguardar que os serviços estejam prontos
echo ""
echo "⏳ Aguardando que os serviços estejam prontos..."

# Função para verificar se um serviço está pronto
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service | grep -q "healthy\|Up"; then
            echo "✅ $service está pronto"
            return 0
        fi
        
        echo "   Tentativa $attempt/$max_attempts - Aguardando $service..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service não ficou pronto a tempo"
    return 1
}

# Aguardar pelos serviços
wait_for_service postgres
wait_for_service redis
wait_for_service financeflow

# Verificar estado final
echo ""
echo "📊 Estado dos serviços:"
docker-compose ps

# Mostrar informações de acesso
echo ""
echo "🎉 Configuração concluída com sucesso!"
echo ""
echo "📱 Acesso à Aplicação:"
echo "   URL: http://localhost:3000"
echo "   Email: demo@financeflow.local"
echo "   Password: demo123"
echo ""
echo "🗄️  Acesso à Base de Dados:"
echo "   Host: localhost"
echo "   Porta: 5432"
echo "   Base de Dados: financeflow"
echo "   Utilizador: financeflow_user"
echo "   Password: financeflow_password"
echo ""
echo "📝 Comandos Úteis:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo "   Backup: docker-compose run --rm backup"
echo ""
echo "⚠️  Importante:"
echo "   - Edite o ficheiro .env para configurações de produção"
echo "   - Configure backups regulares"
echo "   - Altere passwords padrão para produção"
echo ""