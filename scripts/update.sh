#!/bin/bash

# FinanceFlow Update Script
# Atualiza a aplicação mantendo os dados

set -e

echo "🔄 FinanceFlow - Atualização da Aplicação"
echo "========================================"

# Verificar se há alterações não guardadas
if [ -d ".git" ]; then
    if ! git diff-index --quiet HEAD --; then
        echo "⚠️  Há alterações não guardadas no repositório"
        echo "   Faça commit ou stash das alterações antes de continuar"
        exit 1
    fi
fi

# Criar backup antes da atualização
echo "📦 Criando backup de segurança..."
./scripts/backup.sh

# Parar aplicação (manter base de dados)
echo "⏸️  Parando aplicação..."
docker-compose stop financeflow

# Atualizar código (se usando git)
if [ -d ".git" ]; then
    echo "📥 Atualizando código..."
    git pull origin main
fi

# Reconstruir imagem
echo "🏗️  Reconstruindo aplicação..."
docker-compose build financeflow

# Executar migrações (se necessário)
echo "🗄️  Verificando migrações da base de dados..."
# Aqui seria executado um script de migração se necessário

# Reiniciar aplicação
echo "🚀 Reiniciando aplicação..."
docker-compose up -d financeflow

# Verificar se está a funcionar
echo "🔍 Verificando estado da aplicação..."
sleep 10

if docker-compose ps financeflow | grep -q "Up"; then
    echo "✅ Atualização concluída com sucesso!"
    echo "   Aplicação: http://localhost:3000"
else
    echo "❌ Erro na atualização. Verificar logs:"
    docker-compose logs financeflow
    exit 1
fi

echo ""
echo "📊 Estado dos serviços:"
docker-compose ps