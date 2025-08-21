# 🚀 Guia de Instalação e Configuração - CI-Connect

## 📋 Pré-requisitos

### Ambiente de Desenvolvimento
- **Node.js** 18+ (recomendado: 18.17.0 ou superior)
- **Python** 3.9+ 
- **MongoDB** 6.0+ (ou Docker)
- **Git** para controle de versão

### Ferramentas Opcionais
- **Docker** e **Docker Compose** (para ambiente containerizado)
- **VS Code** com extensões recomendadas
- **Postman** para testar APIs

## 🔧 Configuração Local (Desenvolvimento)

### 1. Clone e Configuração Inicial

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd ci-connect

# Copie os arquivos de ambiente
cp backend/.env.example backend/.env
cp ai-services/.env.example ai-services/.env
```

### 2. Configuração do Backend (Node.js)

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente no arquivo .env
# Edite backend/.env com suas configurações:
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ci-connect
JWT_SECRET=sua-chave-jwt-super-secreta
FRONTEND_URL=http://localhost:3000

# Iniciar MongoDB (se não estiver usando Docker)
# No Ubuntu/Debian: sudo systemctl start mongod
# No macOS: brew services start mongodb-community

# Configurar banco de dados
node database/setup.js

# Iniciar servidor de desenvolvimento
npm run dev
```

### 3. Configuração do Frontend (React)

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
echo "REACT_APP_API_URL=http://localhost:5000" > .env
echo "REACT_APP_AI_API_URL=http://localhost:8000" >> .env

# Iniciar servidor de desenvolvimento
npm start
```

### 4. Configuração dos Serviços de IA (Python)

```bash
cd ai-services

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Linux/macOS:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Baixar modelos de NLP necessários
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Configurar variáveis de ambiente no arquivo .env
echo "MONGODB_URI=mongodb://localhost:27017/ci-connect" > .env
echo "SECRET_KEY=sua-chave-secreta-ai" >> .env
echo "DEBUG=True" >> .env

# Iniciar servidor
python app.py
```

## 🐳 Configuração com Docker (Recomendado)

### 1. Usando Docker Compose

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd ci-connect

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Iniciar todos os serviços
docker-compose up -d

# Verificar status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar todos os serviços
docker-compose down
```

### 2. Configuração Inicial do Banco

```bash
# Executar setup do banco (apenas primeira vez)
docker-compose exec mongodb mongosh ci-connect /app/database/setup.js
```

## 📱 Extensões Recomendadas para VS Code

### Frontend (React/JavaScript)
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**

### Backend (Node.js)
- **Node.js Extension Pack**
- **REST Client** (para testar APIs)
- **MongoDB for VS Code**

### AI Services (Python)
- **Python**
- **Pylance**
- **Python Docstring Generator**
- **Jupyter**

### Geral
- **GitLens**
- **Thunder Client** (alternativa ao Postman)
- **Docker**
- **YAML**

## 🧪 Testes e Verificação

### Verificar Backend
```bash
# Teste de saúde da API
curl http://localhost:5000/health

# Resposta esperada:
# {"status":"OK","timestamp":"...","uptime":...}
```

### Verificar Frontend
```bash
# Abrir no navegador
open http://localhost:3000
```

### Verificar AI Services
```bash
# Teste de saúde dos serviços de IA
curl http://localhost:8000/health

# Resposta esperada:
# {"status":"healthy","service":"CI-Connect AI Services","version":"1.0.0"}
```

### Verificar MongoDB
```bash
# Conectar ao MongoDB
mongosh mongodb://localhost:27017/ci-connect

# Verificar coleções
show collections

# Verificar dados de exemplo
db.laboratories.find()
```

## 🛠️ Scripts Úteis

### Package.json Scripts (Backend)
```bash
npm run dev       # Desenvolvimento com nodemon
npm run start     # Produção
npm run test      # Executar testes
npm run lint      # Verificar código
npm run lint:fix  # Corrigir problemas de linting
```

### Package.json Scripts (Frontend)
```bash
npm start         # Desenvolvimento
npm run build     # Build para produção
npm run test      # Executar testes
npm run eject     # Ejetar configuração (cuidado!)
```

### Scripts Python (AI Services)
```bash
python app.py                    # Iniciar servidor
python -m pytest tests/         # Executar testes
python -m black .                # Formatação de código
python -m flake8 .               # Verificar estilo
```

## 🔧 Solução de Problemas Comuns

### Erro de conexão com MongoDB
```bash
# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Reiniciar MongoDB
sudo systemctl restart mongod

# Verificar logs do MongoDB
sudo journalctl -u mongod
```

### Erro de porta em uso
```bash
# Verificar que processo está usando a porta
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
lsof -i :8000  # AI Services

# Matar processo se necessário
kill -9 <PID>
```

### Problemas com dependências Python
```bash
# Recriar ambiente virtual
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Problemas com Node.js
```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 🌐 URLs de Acesso

Após a configuração bem-sucedida:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Services**: http://localhost:8000
- **MongoDB**: mongodb://localhost:27017/ci-connect
- **Documentação da API**: http://localhost:5000/api/docs (futuro)

## 📝 Próximos Passos

1. **Configurar autenticação**: Criar primeira conta de administrador
2. **Popular dados**: Adicionar usuários, projetos e laboratórios de teste
3. **Testar funcionalidades**: Verificar recomendações e mapa de rede
4. **Configurar produção**: Deploy em ambiente cloud

## 💡 Dicas de Desenvolvimento

- Use **nodemon** no backend para reload automático
- Use **React Developer Tools** para debug do frontend
- Configure **ESLint** e **Prettier** para código consistente
- Use **Thunder Client** no VS Code para testar APIs
- Mantenha o banco de dados com dados de teste realistas

## 🆘 Suporte

- **Documentação**: Consulte README.md para informações gerais
- **Issues**: Use GitHub Issues para reportar problemas
- **Discussões**: Use GitHub Discussions para dúvidas
- **Email**: ci-connect@ci.ufpb.br
