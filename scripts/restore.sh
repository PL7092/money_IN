#!/bin/bash

# FinanceFlow Restore Script for MariaDB
# Restaura backup da base de dados MariaDB

set -e

if [ $# -eq 0 ]; then
    echo "❌ Uso: $0 <ficheiro_backup.sql.gz>"
    echo ""
    echo "📋 Backups disponíveis:"
    ls -1 ./backups/financeflow_mariadb_backup_*.sql.gz 2>/dev/null || echo "   Nenhum backup encontrado"
    exit 1
fi

BACKUP_FILE=$1
BACKUP_PATH="./backups/${BACKUP_FILE}"

echo "🔄 FinanceFlow - Restauro da Base de Dados MariaDB"
echo "================================================"

# Verificar se o ficheiro existe
if [ ! -f "$BACKUP_PATH" ]; then
    echo "❌ Ficheiro de backup não encontrado: $BACKUP_PATH"
    exit 1
fi

# Verificar se MariaDB está a correr
if ! docker-compose ps mariadb | grep -q "Up"; then
    echo "❌ MariaDB não está a correr. Inicie com: docker-compose up -d mariadb"
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

echo "📥 Restaurando base de dados MariaDB..."

# Descomprimir e restaurar
gunzip -c "$BACKUP_PATH" | docker-compose exec -T mariadb mysql -u root -pfinanceflow_root_password

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

echo ""
echo "🐳 Nota para Unraid:"
echo "   Use o Compose Manager para gerir a stack"
echo "   Backups ficam em /mnt/user/appdata/financeflow/backups"