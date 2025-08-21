const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode exceder 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    maxlength: [2000, 'Descrição não pode exceder 2000 caracteres']
  },
  status: {
    type: String,
    enum: ['Planning', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Membros e papéis
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member', 'advisor'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Afiliação institucional
  laboratory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Laboratory',
    default: null
  },
  academicLeague: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicLeague',
    default: null
  },
  
  // Datas do projeto
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  estimatedDuration: {
    type: Number, // em meses
    min: 1,
    max: 60
  },
  
  // Recursos e links
  repositoryUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/.*$/,
      'URL deve ser de um repositório válido (GitHub, GitLab, Bitbucket)'
    ]
  },
  websiteUrl: {
    type: String,
    trim: true
  },
  documentationUrl: {
    type: String,
    trim: true
  },
  
  // Objetivos e metodologia
  objectives: [{
    description: {
      type: String,
      required: true,
      maxlength: 500
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  
  methodology: {
    type: String,
    maxlength: 1000
  },
  
  // Tecnologias utilizadas
  technologies: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['language', 'framework', 'library', 'tool', 'database', 'platform'],
      required: true
    }
  }],
  
  // Atualizações do projeto
  updates: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    type: {
      type: String,
      enum: ['progress', 'milestone', 'announcement', 'issue'],
      default: 'progress'
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Publicações relacionadas
  publications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publication'
  }],
  
  // Configurações de visibilidade
  visibility: {
    type: String,
    enum: ['public', 'restricted', 'private'],
    default: 'public'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Métricas e interações
  views: {
    type: Number,
    default: 0
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Avaliação e feedback
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Financiamento
  funding: {
    hasSupport: {
      type: Boolean,
      default: false
    },
    source: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      min: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para performance e busca
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });
projectSchema.index({ status: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ laboratory: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ visibility: 1 });

// Virtual para contagem de membros
projectSchema.virtual('membersCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Virtual para contagem de seguidores
projectSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual para progresso do projeto
projectSchema.virtual('progress').get(function() {
  if (!this.objectives || this.objectives.length === 0) return 0;
  
  const completedObjectives = this.objectives.filter(obj => obj.completed).length;
  return Math.round((completedObjectives / this.objectives.length) * 100);
});

// Virtual para duração atual
projectSchema.virtual('currentDuration').get(function() {
  const start = this.startDate;
  const end = this.endDate || new Date();
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.round(diffDays / 30); // em meses
});

// Middleware para validar datas
projectSchema.pre('save', function(next) {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    const error = new Error('Data de fim não pode ser anterior à data de início');
    return next(error);
  }
  next();
});

// Middleware para atualizar status baseado nas datas
projectSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.endDate && now > this.endDate && this.status === 'Ongoing') {
    this.status = 'Completed';
  }
  
  next();
});

// Método para adicionar membro
projectSchema.methods.addMember = async function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
    await this.save();
  }
  
  return this;
};

// Método para remover membro
projectSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  await this.save();
  return this;
};

// Método para adicionar atualização
projectSchema.methods.addUpdate = async function(updateData) {
  this.updates.unshift({
    ...updateData,
    createdAt: new Date()
  });
  
  // Manter apenas as últimas 50 atualizações
  if (this.updates.length > 50) {
    this.updates = this.updates.slice(0, 50);
  }
  
  await this.save();
  return this;
};

// Método para verificar se usuário é membro
projectSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Método para obter papel do usuário
projectSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

// Método estático para buscar projetos por tecnologia
projectSchema.statics.findByTechnology = function(techName) {
  return this.find({
    'technologies.name': new RegExp(techName, 'i')
  });
};

// Método estático para projetos em destaque
projectSchema.statics.getFeatured = function(limit = 10) {
  return this.find({
    visibility: 'public',
    status: { $in: ['Ongoing', 'Completed'] }
  })
  .sort({ views: -1, followersCount: -1, createdAt: -1 })
  .limit(limit)
  .populate('members.user', 'name profilePicture')
  .populate('laboratory', 'name');
};

module.exports = mongoose.model('Project', projectSchema);
