const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@(ci\.ufpb\.br|ufpb\.br)$/,
      'Email deve ser institucional (@ci.ufpb.br ou @ufpb.br)'
    ]
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false // Não incluir por padrão nas consultas
  },
  role: {
    type: String,
    enum: ['student', 'professor', 'admin'],
    default: 'student'
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio não pode exceder 500 caracteres'],
    default: ''
  },
  interests: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  
  // Dados acadêmicos específicos para estudantes
  course: {
    type: String,
    trim: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 20
  },
  enrollmentYear: {
    type: Number,
    min: 2000,
    max: new Date().getFullYear()
  },
  
  // Dados específicos para professores
  department: {
    type: String,
    trim: true
  },
  researchAreas: [{
    type: String,
    trim: true
  }],
  lattesUrl: {
    type: String,
    trim: true
  },
  
  // Configurações e preferências
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    projectUpdates: {
      type: Boolean,
      default: true
    },
    opportunities: {
      type: Boolean,
      default: true
    }
  },
  
  // Métricas sociais
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Timestamps
  lastLoginAt: {
    type: Date,
    default: null
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ interests: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ course: 1 });
userSchema.index({ department: 1 });

// Virtual para contagem de seguidores
userSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual para contagem de seguindo
userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware para verificar se o perfil está completo
userSchema.pre('save', function(next) {
  const requiredFields = ['name', 'email', 'bio'];
  const roleSpecificFields = {
    student: ['course', 'semester'],
    professor: ['department', 'researchAreas'],
    admin: []
  };
  
  const hasRequiredFields = requiredFields.every(field => this[field] && this[field].length > 0);
  const hasRoleFields = roleSpecificFields[this.role].every(field => 
    this[field] && (Array.isArray(this[field]) ? this[field].length > 0 : this[field])
  );
  
  this.isProfileComplete = hasRequiredFields && hasRoleFields && 
                          this.interests.length > 0 && this.skills.length > 0;
  
  next();
});

// Método para verificar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para seguir outro usuário
userSchema.methods.follow = async function(userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
    await this.save();
    
    // Adicionar este usuário aos seguidores do outro usuário
    await this.constructor.findByIdAndUpdate(userId, {
      $addToSet: { followers: this._id }
    });
  }
};

// Método para deixar de seguir outro usuário
userSchema.methods.unfollow = async function(userId) {
  this.following = this.following.filter(id => !id.equals(userId));
  await this.save();
  
  // Remover este usuário dos seguidores do outro usuário
  await this.constructor.findByIdAndUpdate(userId, {
    $pull: { followers: this._id }
  });
};

// Método para obter perfil público
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

// Método estático para buscar usuários por habilidades/interesses
userSchema.statics.findBySkillsOrInterests = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $or: [
      { skills: { $regex: searchRegex } },
      { interests: { $regex: searchRegex } },
      { bio: { $regex: searchRegex } }
    ]
  });
};

module.exports = mongoose.model('User', userSchema);
