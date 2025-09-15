#!/bin/bash

# FinanceFlow Backup Script
# Cria backup completo da base de dados e ficheiros

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="financeflow_backup_${DATE}.sql"

echo "🗄️  FinanceFlow - Backup da Base de Dados"
echo "========================================="

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Verificar se PostgreSQL está a correr
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL não está a correr. Inicie com: docker-compose up -d postgres"
    exit 1
fi

echo "📦 Criando backup da base de dados..."

# Criar backup da base de dados
docker-compose exec -T postgres pg_dump \
    -U financeflow_user \
    -d financeflow \
    --clean \
    --if-exists \
    --create \
    --verbose > "${BACKUP_DIR}/${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "✅ Backup criado com sucesso: ${BACKUP_FILE}"
    
    # Comprimir backup
    gzip "${BACKUP_DIR}/${BACKUP_FILE}"
    echo "🗜️  Backup comprimido: ${BACKUP_FILE}.gz"
    
    # Mostrar tamanho do backup
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}.gz" | cut -f1)
    echo "📏 Tamanho do backup: ${BACKUP_SIZE}"
    
    # Limpar backups antigos (manter últimos 30 dias)
    find $BACKUP_DIR -name "financeflow_backup_*.sql.gz" -mtime +30 -delete
    echo "🧹 Backups antigos removidos (>30 dias)"
    
else
    echo "❌ Erro ao criar backup"
    exit 1
fi

echo ""
echo "📋 Backups disponíveis:"
ls -lah $BACKUP_DIR/financeflow_backup_*.sql.gz 2>/dev/null || echo "   Nenhum backup encontrado"

echo ""
echo "💡 Para restaurar um backup:"
echo "   ./scripts/restore.sh ${BACKUP_FILE}.gz"