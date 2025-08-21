# CI-Connect: Ecossistema Digital para o Centro de Informática da UFPB

## 📋 Visão Geral

O CI-Connect é uma plataforma digital inovadora projetada para conectar e fortalecer a comunidade acadêmica do Centro de Informática da UFPB. Funcionando como o "LinkedIn" do CI, a plataforma foca na colaboração, disseminação de conhecimento científico e conexões significativas entre estudantes, professores e pesquisadores.

## 🚀 Principais Funcionalidades

### Para Estudantes
- **Perfis Acadêmicos Personalizados**: Criação de perfis profissionais com habilidades, interesses e projetos
- **Sistema de Recomendação**: Descoberta de projetos e oportunidades relevantes usando IA
- **Mapa de Conexões**: Visualização interativa da rede acadêmica do CI
- **Hub de Oportunidades**: Centralização de estágios, bolsas e eventos

### Para Professores
- **Divulgação de Pesquisas**: Showcase de projetos e publicações científicas
- **Gestão de Orientandos**: Acompanhamento e mentoria de estudantes
- **Colaboração Inter-laboratorial**: Facilitação de parcerias entre grupos de pesquisa

### Para a Comunidade
- **Feed Social Acadêmico**: Atualizações em tempo real de projetos e conquistas
- **Vitrine de Laboratórios**: Apresentação oficial dos grupos de pesquisa
- **Ligas Acadêmicas**: Espaço para organizações estudantis

## 🏗️ Arquitetura Técnica

### Arquitetura Híbrida de Microsserviços

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  AI Services    │
│   (React.js)    │◄──►│ (Node.js/Express)│◄──►│   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    Database     │
                       │   (MongoDB)     │
                       └─────────────────┘
```

### Stack Tecnológica

#### Frontend (React.js)
- **Interface Moderna**: Componentes reutilizáveis e responsivos
- **UX Intuitiva**: Design minimalista profissional
- **Interatividade**: Visualizações dinâmicas com vis.js

#### Backend (Node.js + Express.js)
- **API RESTful**: Endpoints bem estruturados e documentados
- **Autenticação**: Sistema seguro de login e autorização
- **Performance**: Arquitetura não-bloqueante para alta concorrência

#### Banco de Dados (MongoDB)
- **Flexibilidade**: Estrutura de documentos para dados acadêmicos complexos
- **Escalabilidade**: Otimizado para consultas de grafos e recomendações
- **Indexação**: Busca eficiente por tags, habilidades e interesses

#### Serviços de IA (Python)
- **Recomendações**: Sistema baseado em conteúdo usando TF-IDF
- **Análise de Redes**: Processamento de grafos acadêmicos
- **Machine Learning**: Scikit-learn, Pandas, NumPy

## 📊 Modelo de Dados

### Entidades Principais

#### Usuários (users)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String, // @ci.ufpb.br
  role: ["student", "professor", "admin"],
  bio: String,
  interests: [String],
  skills: [String],
  profilePicture: String
}
```

#### Projetos (projects)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: ["Planning", "Ongoing", "Completed"],
  tags: [String],
  members: [ObjectId],
  laboratory: ObjectId,
  updates: [{
    authorId: ObjectId,
    content: String,
    timestamp: Date
  }]
}
```

#### Laboratórios (laboratories)
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  members: [ObjectId],
  projects: [ObjectId],
  logo: String
}
```

#### Oportunidades (opportunities)
```javascript
{
  _id: ObjectId,
  title: String,
  type: ["Internship", "Scholarship", "Event"],
  description: String,
  deadline: Date,
  tags: [String]
}
```

## 🤖 Funcionalidades Inteligentes

### Sistema de Recomendação
- **Algoritmo**: Filtragem baseada em conteúdo com TF-IDF
- **Entrada**: Perfil do usuário (bio, interesses, habilidades)
- **Saída**: Projetos ranqueados por similaridade de cosseno
- **Atualização**: Em tempo real conforme novos projetos são adicionados

### Mapa de Conexões Acadêmicas
- **Visualização**: Grafo interativo com vis.js
- **Nós**: Usuários, projetos, laboratórios
- **Arestas**: Relacionamentos de membros, orientação, colaboração
- **Interatividade**: Zoom, filtragem, navegação por cliques

## 🚀 Roteiro de Desenvolvimento

### Fase 1: MVP (Produto Mínimo Viável)
- [x] Arquitetura base e configuração do ambiente
- [ ] Autenticação e perfis de usuário
- [ ] CRUD de projetos e laboratórios
- [ ] Interface básica e navegação
- [ ] Sistema de postagens e feed

### Fase 2: Inteligência e Interatividade
- [ ] Sistema de recomendação de projetos
- [ ] Mapa de conexões acadêmicas
- [ ] Busca avançada e filtragem
- [ ] Notificações em tempo real

### Fase 3: Expansão e Integração
- [ ] Recomendações híbridas (colaborativas + conteúdo)
- [ ] Integração com sistemas da UFPB
- [ ] Gamificação e badges
- [ ] Aplicativo móvel

## 🛠️ Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- Python 3.9+
- MongoDB 6.0+
- Docker (opcional)

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd ci-connect
```

2. **Configure o Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run dev
```

3. **Configure o Frontend**
```bash
cd frontend
npm install
npm start
```

4. **Configure os Serviços de IA**
```bash
cd ai-services
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py
```

5. **Configure o Banco de Dados**
```bash
cd database
# Execute os scripts de inicialização
node setup.js
```

### Usando Docker
```bash
docker-compose up -d
```

## 📈 Métricas de Sucesso

### KPIs Principais
- **Usuários Ativos Mensais (MAU)**: Meta de 500+ no primeiro semestre
- **Projetos Criados**: 50+ projetos documentados no primeiro ano
- **Taxa de Engajamento**: 70% dos usuários ativos semanalmente
- **Conexões Iniciadas**: 100+ novas colaborações atribuíveis à plataforma

### Monitoramento
- Dashboard de analytics integrado
- Feedback contínuo da comunidade
- Métricas de performance técnico

## 🤝 Contribuição

### Diretrizes para Contribuidores
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código
- **Frontend**: ESLint + Prettier para React
- **Backend**: ESLint + Nodemon para desenvolvimento
- **Python**: PEP 8 + Black formatter
- **Commits**: Conventional Commits

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

- **Equipe de Desenvolvimento**: ci-connect@ci.ufpb.br
- **Centro de Informática UFPB**: https://ci.ufpb.br
- **Issues**: Use o GitHub Issues para reportar bugs ou sugerir melhorias

---

**CI-Connect** - Conectando mentes, construindo o futuro da computação na UFPB 🚀
