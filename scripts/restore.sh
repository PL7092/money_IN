#!/bin/bash

# FinanceFlow Restore Script
# Restaura backup da base de dados

set -e

if [ $# -eq 0 ]; then
    echo "❌ Uso: $0 <ficheiro_backup.sql.gz>"
    echo ""
    echo "📋 Backups disponíveis:"
    ls -1 ./backups/financeflow_backup_*.sql.gz 2>/dev/null || echo "   Nenhum backup encontrado"
    exit 1
fi

BACKUP_FILE=$1
BACKUP_PATH="./backups/${BACKUP_FILE}"

echo "🔄 FinanceFlow - Restauro da Base de Dados"
echo "=========================================="

# Verificar se o ficheiro existe
if [ ! -f "$BACKUP_PATH" ]; then
    echo "❌ Ficheiro de backup não encontrado: $BACKUP_PATH"
    exit 1
fi

# Verificar se PostgreSQL está a correr
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL não está a correr. Inicie com: docker-compose up -d postgres"
    exit 1
fi

echo "⚠️  ATENÇÃO: Este processo irá substituir todos os dados existentes!"
echo "   Ficheiro: $BACKUP_FILE"
echo "   Tamanho: $(du -h "$BACKUP_PATH" | cut -f1)"
echo ""
read -p "Continuar? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo "🗄️  Parando aplicação..."
docker-compose stop financeflow

echo "📥 Restaurando base de dados..."

# Descomprimir e restaurar
gunzip -c "$BACKUP_PATH" | docker-compose exec -T postgres psql -U financeflow_user -d postgres

if [ $? -eq 0 ]; then
    echo "✅ Restauro concluído com sucesso"
    
    echo "🚀 Reiniciando aplicação..."
    docker-compose start financeflow
    
    echo ""
    echo "🎉 Restauro completo!"
    echo "   Aplicação: http://localhost:3000"
    
else
    echo "❌ Erro durante o restauro"
    echo "🚀 Reiniciando aplicação..."
    docker-compose start financeflow
    exit 1
fi