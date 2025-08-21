// Esquemas MongoDB para CI-Connect
// Este arquivo define a estrutura de dados e índices necessários

// Coleção: users
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "interests": 1 })
db.users.createIndex({ "skills": 1 })
db.users.createIndex({ "course": 1 })
db.users.createIndex({ "department": 1 })
db.users.createIndex({ "name": "text", "bio": "text" })

// Coleção: projects
db.projects.createIndex({ "title": "text", "description": "text", "tags": "text" })
db.projects.createIndex({ "status": 1 })
db.projects.createIndex({ "tags": 1 })
db.projects.createIndex({ "members.user": 1 })
db.projects.createIndex({ "laboratory": 1 })
db.projects.createIndex({ "createdAt": -1 })
db.projects.createIndex({ "visibility": 1 })
db.projects.createIndex({ "status": 1, "visibility": 1 })

// Coleção: laboratories
db.laboratories.createIndex({ "name": 1 }, { unique: true })
db.laboratories.createIndex({ "members": 1 })
db.laboratories.createIndex({ "name": "text", "description": "text" })

// Coleção: opportunities
db.opportunities.createIndex({ "type": 1 })
db.opportunities.createIndex({ "deadline": 1 })
db.opportunities.createIndex({ "tags": 1 })
db.opportunities.createIndex({ "title": "text", "description": "text" })
db.opportunities.createIndex({ "deadline": 1, "type": 1 })

// Coleção: publications
db.publications.createIndex({ "authors": 1 })
db.publications.createIndex({ "year": -1 })
db.publications.createIndex({ "journal": 1 })
db.publications.createIndex({ "title": "text", "abstract": "text" })

// Coleção: academic_leagues
db.academic_leagues.createIndex({ "name": 1 }, { unique: true })
db.academic_leagues.createIndex({ "members": 1 })
db.academic_leagues.createIndex({ "name": "text", "description": "text" })

// Coleção: activities (para feed de atividades)
db.activities.createIndex({ "user": 1 })
db.activities.createIndex({ "timestamp": -1 })
db.activities.createIndex({ "type": 1 })
db.activities.createIndex({ "user": 1, "timestamp": -1 })

// Coleção: notifications
db.notifications.createIndex({ "recipient": 1 })
db.notifications.createIndex({ "timestamp": -1 })
db.notifications.createIndex({ "read": 1 })
db.notifications.createIndex({ "recipient": 1, "read": 1 })

// Coleção: connections (para rede social)
db.connections.createIndex({ "from": 1 })
db.connections.createIndex({ "to": 1 })
db.connections.createIndex({ "from": 1, "to": 1 }, { unique: true })
db.connections.createIndex({ "status": 1 })

print("✅ Índices criados com sucesso!")

// Dados iniciais de exemplo
print("📝 Inserindo dados de exemplo...")

// Inserir departamentos/laboratórios
db.laboratories.insertMany([
  {
    _id: ObjectId(),
    name: "Laboratório de Inteligência Artificial",
    description: "Pesquisa em IA, Machine Learning e Deep Learning",
    location: "CI - Sala 101",
    logoUrl: null,
    members: [],
    projects: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: "Laboratório de Engenharia de Software",
    description: "Desenvolvimento de metodologias e ferramentas para engenharia de software",
    location: "CI - Sala 102",
    logoUrl: null,
    members: [],
    projects: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: "Laboratório de Redes e Sistemas Distribuídos",
    description: "Pesquisa em redes de computadores, IoT e sistemas distribuídos",
    location: "CI - Sala 103",
    logoUrl: null,
    members: [],
    projects: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// Inserir ligas acadêmicas
db.academic_leagues.insertMany([
  {
    _id: ObjectId(),
    name: "Liga de Programação Competitiva",
    description: "Grupo focado em competições de programação e algoritmos",
    logoUrl: null,
    members: [],
    activities: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: "Liga de Desenvolvimento Web",
    description: "Comunidade de desenvolvedores web do CI",
    logoUrl: null,
    members: [],
    activities: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// Inserir oportunidades de exemplo
db.opportunities.insertMany([
  {
    _id: ObjectId(),
    title: "Estágio em Data Science - Empresa X",
    type: "Internship",
    description: "Oportunidade de estágio em ciência de dados com foco em machine learning e análise de dados. Requisitos: Python, SQL, conhecimentos em estatística.",
    requirements: ["Python", "SQL", "Machine Learning", "Estatística"],
    deadline: new Date("2025-03-15"),
    company: "Empresa X Tecnologia",
    location: "João Pessoa - PB",
    tags: ["data-science", "python", "machine-learning", "estagio"],
    applicationUrl: "https://empresa-x.com/vagas/estagio-data-science",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    title: "Bolsa de Iniciação Científica - PIBIC",
    type: "Scholarship",
    description: "Bolsa PIBIC para projeto de pesquisa em inteligência artificial aplicada à educação. Duração: 12 meses.",
    requirements: ["Interesse em IA", "Disponibilidade 20h/semana"],
    deadline: new Date("2025-02-28"),
    supervisor: "Prof. Dr. João Silva",
    value: 400.00,
    tags: ["pibic", "ia", "educacao", "bolsa"],
    applicationUrl: "mailto:joao.silva@ci.ufpb.br",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

print("✅ Dados de exemplo inseridos com sucesso!")
print("🎯 Banco de dados CI-Connect configurado e pronto para uso!")
