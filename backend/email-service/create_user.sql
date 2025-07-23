-- Script para criar usuário e banco de dados para o Vibe Email Service
-- Execute como administrador MySQL

-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS vibe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário específico para o serviço
CREATE USER IF NOT EXISTS 'vibe_user'@'localhost' IDENTIFIED BY 'vibe_password';

-- Conceder permissões necessárias
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON vibe.* TO 'vibe_user'@'localhost';

-- Aplicar alterações
FLUSH PRIVILEGES;

-- Verificar permissões
SHOW GRANTS FOR 'vibe_user'@'localhost';
