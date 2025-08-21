import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler
import logging
from datetime import datetime, timedelta
from collections import Counter
import re

logger = logging.getLogger(__name__)

class RecommendationService:
    """
    Serviço de recomendação usando técnicas de Machine Learning
    Implementa filtragem baseada em conteúdo e filtragem colaborativa
    """
    
    def __init__(self, database_connection):
        self.db = database_connection
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            lowercase=True,
            ngram_range=(1, 2)
        )
        self.project_vectors = None
        self.user_vectors = None
        self.similarity_matrix = None
        
    def get_project_recommendations(self, user_id, limit=10, algorithm='content_based'):
        """
        Obter recomendações de projetos para um usuário
        
        Args:
            user_id (str): ID do usuário
            limit (int): Número máximo de recomendações
            algorithm (str): Algoritmo a usar ('content_based' ou 'collaborative')
            
        Returns:
            list: Lista de projetos recomendados com scores
        """
        try:
            if algorithm == 'content_based':
                return self._content_based_project_recommendations(user_id, limit)
            elif algorithm == 'collaborative':
                return self._collaborative_project_recommendations(user_id, limit)
            else:
                # Híbrido: combina ambos os algoritmos
                content_recs = self._content_based_project_recommendations(user_id, limit)
                collab_recs = self._collaborative_project_recommendations(user_id, limit)
                return self._combine_recommendations(content_recs, collab_recs, limit)
                
        except Exception as e:
            logger.error(f"Erro ao gerar recomendações de projetos: {str(e)}")
            return []
    
    def _content_based_project_recommendations(self, user_id, limit):
        """
        Recomendações baseadas no conteúdo do perfil do usuário
        """
        # Buscar dados do usuário
        user_data = self.db.get_user_by_id(user_id)
        if not user_data:
            return []
        
        # Construir perfil textual do usuário
        user_profile = self._build_user_text_profile(user_data)
        
        # Buscar todos os projetos públicos
        projects = self.db.get_all_projects(filters={'visibility': 'public'})
        
        if not projects:
            return []
        
        # Construir corpus de textos (usuário + projetos)
        corpus = [user_profile]
        project_texts = []
        
        for project in projects:
            project_text = self._build_project_text_profile(project)
            corpus.append(project_text)
            project_texts.append(project_text)
        
        # Vetorizar textos usando TF-IDF
        try:
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(corpus)
            
            # Calcular similaridade entre usuário e projetos
            user_vector = tfidf_matrix[0:1]  # Primeiro vetor (usuário)
            project_vectors = tfidf_matrix[1:]  # Demais vetores (projetos)
            
            similarities = cosine_similarity(user_vector, project_vectors).flatten()
            
            # Filtrar projetos onde o usuário já é membro
            user_projects = self.db.get_user_projects(user_id)
            user_project_ids = [str(p['_id']) for p in user_projects]
            
            # Criar lista de recomendações
            recommendations = []
            for idx, project in enumerate(projects):
                if str(project['_id']) not in user_project_ids:
                    recommendations.append({
                        'project_id': str(project['_id']),
                        'title': project['title'],
                        'description': project['description'][:200] + '...',
                        'tags': project.get('tags', []),
                        'similarity_score': float(similarities[idx]),
                        'members_count': len(project.get('members', [])),
                        'status': project.get('status', 'Unknown')
                    })
            
            # Ordenar por similaridade e retornar top N
            recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Erro na vetorização TF-IDF: {str(e)}")
            return []
    
    def _collaborative_project_recommendations(self, user_id, limit):
        """
        Recomendações baseadas em filtragem colaborativa
        """
        try:
            # Construir matriz usuário-projeto
            user_project_matrix = self._build_user_project_matrix()
            
            if user_project_matrix.empty:
                return []
            
            # Aplicar SVD para redução de dimensionalidade
            svd = TruncatedSVD(n_components=50, random_state=42)
            user_factors = svd.fit_transform(user_project_matrix.fillna(0))
            
            # Encontrar usuários similares
            if user_id not in user_project_matrix.index:
                return []
            
            user_idx = user_project_matrix.index.get_loc(user_id)
            user_vector = user_factors[user_idx].reshape(1, -1)
            
            similarities = cosine_similarity(user_vector, user_factors).flatten()
            similar_users_idx = np.argsort(similarities)[::-1][1:11]  # Top 10 usuários similares
            
            # Recomendar projetos dos usuários similares
            recommended_projects = {}
            
            for similar_idx in similar_users_idx:
                similar_user_id = user_project_matrix.index[similar_idx]
                similar_user_projects = self.db.get_user_projects(similar_user_id)
                
                for project in similar_user_projects:
                    project_id = str(project['_id'])
                    if project_id not in recommended_projects:
                        recommended_projects[project_id] = {
                            'project_id': project_id,
                            'title': project['title'],
                            'description': project['description'][:200] + '...',
                            'tags': project.get('tags', []),
                            'similarity_score': similarities[similar_idx],
                            'members_count': len(project.get('members', [])),
                            'status': project.get('status', 'Unknown')
                        }
            
            # Filtrar projetos onde o usuário já é membro
            user_projects = self.db.get_user_projects(user_id)
            user_project_ids = [str(p['_id']) for p in user_projects]
            
            recommendations = [
                rec for rec in recommended_projects.values()
                if rec['project_id'] not in user_project_ids
            ]
            
            # Ordenar por score e retornar top N
            recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Erro na filtragem colaborativa: {str(e)}")
            return []
    
    def get_user_recommendations(self, user_id, limit=10, filters=None):
        """
        Recomendar usuários para conectar
        """
        try:
            # Buscar dados do usuário atual
            current_user = self.db.get_user_by_id(user_id)
            if not current_user:
                return []
            
            # Buscar usuários candidatos
            candidate_filters = {'_id': {'$ne': user_id}}
            if filters:
                if 'role' in filters:
                    candidate_filters['role'] = filters['role']
            
            candidates = self.db.get_users(filters=candidate_filters)
            
            if not candidates:
                return []
            
            # Calcular similaridade baseada em interesses e habilidades
            current_interests = set(current_user.get('interests', []))
            current_skills = set(current_user.get('skills', []))
            
            recommendations = []
            
            for candidate in candidates:
                candidate_interests = set(candidate.get('interests', []))
                candidate_skills = set(candidate.get('skills', []))
                
                # Calcular similaridades
                interest_similarity = self._jaccard_similarity(current_interests, candidate_interests)
                skill_similarity = self._jaccard_similarity(current_skills, candidate_skills)
                
                # Score combinado
                combined_score = (interest_similarity * 0.6) + (skill_similarity * 0.4)
                
                if combined_score > 0.1:  # Threshold mínimo
                    recommendations.append({
                        'user_id': str(candidate['_id']),
                        'name': candidate['name'],
                        'role': candidate['role'],
                        'bio': candidate.get('bio', '')[:150] + '...',
                        'common_interests': list(current_interests.intersection(candidate_interests)),
                        'common_skills': list(current_skills.intersection(candidate_skills)),
                        'similarity_score': combined_score,
                        'profile_picture': candidate.get('profile_picture')
                    })
            
            # Ordenar e retornar top N
            recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Erro ao recomendar usuários: {str(e)}")
            return []
    
    def analyze_project_trends(self):
        """
        Analisar tendências de projetos e tecnologias
        """
        try:
            # Buscar projetos recentes (últimos 6 meses)
            six_months_ago = datetime.now() - timedelta(days=180)
            recent_projects = self.db.get_projects(
                filters={'created_at': {'$gte': six_months_ago}}
            )
            
            # Analisar tecnologias mais usadas
            all_technologies = []
            all_tags = []
            
            for project in recent_projects:
                technologies = project.get('technologies', [])
                tags = project.get('tags', [])
                
                all_technologies.extend([tech['name'] for tech in technologies])
                all_tags.extend(tags)
            
            # Contar frequências
            tech_counter = Counter(all_technologies)
            tag_counter = Counter(all_tags)
            
            return {
                'trending_technologies': [
                    {'name': tech, 'count': count, 'trend': 'up'}
                    for tech, count in tech_counter.most_common(10)
                ],
                'trending_topics': [
                    {'name': tag, 'count': count}
                    for tag, count in tag_counter.most_common(15)
                ],
                'growth_areas': self._identify_growth_areas(recent_projects),
                'analysis_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao analisar tendências: {str(e)}")
            return {'trending_technologies': [], 'trending_topics': [], 'growth_areas': []}
    
    def _build_user_text_profile(self, user_data):
        """
        Construir perfil textual do usuário para análise TF-IDF
        """
        profile_parts = []
        
        # Adicionar bio
        if user_data.get('bio'):
            profile_parts.append(user_data['bio'])
        
        # Adicionar interesses
        if user_data.get('interests'):
            profile_parts.extend(user_data['interests'])
        
        # Adicionar habilidades
        if user_data.get('skills'):
            profile_parts.extend(user_data['skills'])
        
        # Adicionar áreas de pesquisa (para professores)
        if user_data.get('research_areas'):
            profile_parts.extend(user_data['research_areas'])
        
        return ' '.join(profile_parts)
    
    def _build_project_text_profile(self, project_data):
        """
        Construir perfil textual do projeto para análise TF-IDF
        """
        profile_parts = []
        
        # Adicionar título e descrição
        profile_parts.append(project_data.get('title', ''))
        profile_parts.append(project_data.get('description', ''))
        
        # Adicionar tags
        if project_data.get('tags'):
            profile_parts.extend(project_data['tags'])
        
        # Adicionar tecnologias
        if project_data.get('technologies'):
            tech_names = [tech['name'] for tech in project_data['technologies']]
            profile_parts.extend(tech_names)
        
        # Adicionar metodologia
        if project_data.get('methodology'):
            profile_parts.append(project_data['methodology'])
        
        return ' '.join(profile_parts)
    
    def _build_user_project_matrix(self):
        """
        Construir matriz usuário-projeto para filtragem colaborativa
        """
        try:
            # Buscar todos os usuários e projetos
            users = self.db.get_all_users()
            projects = self.db.get_all_projects()
            
            # Criar matriz esparsa
            user_ids = [str(user['_id']) for user in users]
            project_ids = [str(project['_id']) for project in projects]
            
            matrix_data = []
            
            for user in users:
                user_projects = self.db.get_user_projects(str(user['_id']))
                user_project_ids = [str(p['_id']) for p in user_projects]
                
                row = []
                for project_id in project_ids:
                    # 1 se o usuário participa do projeto, 0 caso contrário
                    row.append(1 if project_id in user_project_ids else 0)
                
                matrix_data.append(row)
            
            return pd.DataFrame(matrix_data, index=user_ids, columns=project_ids)
            
        except Exception as e:
            logger.error(f"Erro ao construir matriz usuário-projeto: {str(e)}")
            return pd.DataFrame()
    
    def _jaccard_similarity(self, set1, set2):
        """
        Calcular similaridade de Jaccard entre dois conjuntos
        """
        if not set1 and not set2:
            return 0.0
        
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0.0
    
    def _combine_recommendations(self, content_recs, collab_recs, limit):
        """
        Combinar recomendações de conteúdo e colaborativas
        """
        combined = {}
        
        # Adicionar recomendações baseadas em conteúdo (peso 0.7)
        for rec in content_recs:
            project_id = rec['project_id']
            combined[project_id] = rec.copy()
            combined[project_id]['combined_score'] = rec['similarity_score'] * 0.7
        
        # Adicionar recomendações colaborativas (peso 0.3)
        for rec in collab_recs:
            project_id = rec['project_id']
            if project_id in combined:
                combined[project_id]['combined_score'] += rec['similarity_score'] * 0.3
            else:
                combined[project_id] = rec.copy()
                combined[project_id]['combined_score'] = rec['similarity_score'] * 0.3
        
        # Ordenar por score combinado
        result = list(combined.values())
        result.sort(key=lambda x: x['combined_score'], reverse=True)
        
        return result[:limit]
    
    def _identify_growth_areas(self, projects):
        """
        Identificar áreas de crescimento baseadas nos projetos recentes
        """
        # Análise simples baseada em palavras-chave emergentes
        descriptions = [p.get('description', '') for p in projects]
        all_text = ' '.join(descriptions)
        
        # Palavras-chave de tecnologias emergentes
        emerging_keywords = [
            'machine learning', 'deep learning', 'ai', 'artificial intelligence',
            'blockchain', 'iot', 'internet of things', 'cloud computing',
            'data science', 'big data', 'cybersecurity', 'mobile development',
            'web development', 'react', 'python', 'javascript', 'node.js'
        ]
        
        growth_areas = []
        for keyword in emerging_keywords:
            count = len(re.findall(r'\b' + keyword + r'\b', all_text.lower()))
            if count > 0:
                growth_areas.append({
                    'area': keyword.title(),
                    'project_count': count,
                    'growth_rate': 'high' if count > 5 else 'medium'
                })
        
        return sorted(growth_areas, key=lambda x: x['project_count'], reverse=True)[:10]
