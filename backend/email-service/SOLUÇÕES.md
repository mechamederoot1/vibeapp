# 🔧 Soluções para Problemas do Serviço de Email

## Problemas Identificados e Soluções

### 1. ❌ Erro de Acesso ao Banco MySQL
**Erro:** `Access denied for user 'root'@'localhost' (using password: YES)`

#### Soluções:

**Opção A - Configurar usuário específico (Recomendado):**
```bash
# 1. Conectar ao MySQL como administrador
mysql -u root -p

# 2. Executar comandos SQL:
CREATE DATABASE IF NOT EXISTS vibe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'vibe_user'@'localhost' IDENTIFIED BY 'vibe_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON vibe.* TO 'vibe_user'@'localhost';
FLUSH PRIVILEGES;
```

**Opção B - Usar o script fornecido:**
```bash
# No diretório backend/email-service/
mysql -u root -p < create_user.sql
```

**Opção C - Atualizar senha do root:**
```bash
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Evo@000#!';
FLUSH PRIVILEGES;
```

### 2. ⚠️ Erro 429 (Too Many Requests)
**Erro:** `Failed to load resource: the server responded with a status of 429`

#### Soluções Implementadas:
- ✅ Rate limiting global (30 requests/minuto por IP)
- ✅ Cooldown de 60 segundos entre envios de código
- ✅ Máximo de 5 tentativas por hora por usuário
- ✅ Verificação de tentativas anteriores

### 3. 📧 Configuração SMTP
**Status:** ✅ Configurado para Hostinger

#### Configurações atuais:
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=suporte@meuvibe.com
SMTP_PASS=Dashwoodi@1995
SMTP_FROM=no-reply@meuvibe.com
```

## Como Testar

### Teste Simples (Sem Banco de Dados)
```bash
# 1. Navegar para o diretório
cd backend/email-service

# 2. Instalar dependências
npm install

# 3. Executar serviço de teste
node test-simple.js

# 4. Testar SMTP
curl -X POST http://localhost:3002/test-smtp \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com"}'
```

### Teste Completo (Com Banco de Dados)
```bash
# 1. Configurar banco primeiro (ver seção 1)
# 2. Testar conexão
node test_db_connection.js

# 3. Configurar tabelas
node setup_database.js

# 4. Iniciar serviço
npm start
```

## Verificações de Status

### Health Check
```bash
curl http://localhost:3001/health
```

### Verificar Configurações
```bash
curl http://localhost:3002/health  # Para serviço de teste
```

## Logs e Debugging

### Logs do Serviço Principal
- ✅ Pool de conexões MySQL criado
- 📧 SMTP configurado
- 🚀 Serviço rodando na porta 3001

### Logs do Serviço de Teste
- 🧪 Teste SMTP realizado
- ✅ E-mail enviado com sucesso
- 🚀 Serviço rodando na porta 3002

## Próximos Passos

1. **Configurar Banco MySQL** seguindo uma das opções da seção 1
2. **Testar SMTP** usando o serviço de teste simples
3. **Verificar Rate Limiting** fazendo múltiplas requisições
4. **Configurar Tabelas** usando setup_database.js
5. **Iniciar Serviço Principal** após confirmação das configurações

## Contato para Suporte

Se os problemas persistirem:
- Verificar logs detalhados nos arquivos de serviço
- Confirmar que MySQL está rodando: `systemctl status mysql`
- Verificar conectividade SMTP com telnet: `telnet smtp.hostinger.com 587`
