from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
from dotenv import load_dotenv
import logging

# Importar serviços
from services.recommendation_service import RecommendationService
from services.network_analysis_service import NetworkAnalysisService
from services.text_analysis_service import TextAnalysisService
from utils.database import DatabaseConnection
from utils.auth import require_api_key

# Carregar variáveis de ambiente
load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar aplicação Flask
app = Flask(__name__)
CORS(app)

# Rate limiting
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Configurações
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/ci-connect')

# Inicializar serviços
db = DatabaseConnection(app.config['MONGODB_URI'])
recommendation_service = RecommendationService(db)
network_service = NetworkAnalysisService(db)
text_service = TextAnalysisService()

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de verificação de saúde do serviço"""
    return jsonify({
        'status': 'healthy',
        'service': 'CI-Connect AI Services',
        'version': '1.0.0'
    })

@app.route('/api/recommendations/projects', methods=['POST'])
@limiter.limit("10 per minute")
@require_api_key
def get_project_recommendations():
    """
    Obter recomendações de projetos para um usuário
    
    Body:
    {
        "user_id": "string",
        "limit": int (opcional, default: 10),
        "algorithm": "content_based" | "collaborative" (opcional, default: content_based)
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        limit = data.get('limit', 10)
        algorithm = data.get('algorithm', 'content_based')
        
        if not user_id:
            return jsonify({'error': 'user_id é obrigatório'}), 400
        
        recommendations = recommendation_service.get_project_recommendations(
            user_id=user_id,
            limit=limit,
            algorithm=algorithm
        )
        
        return jsonify({
            'user_id': user_id,
            'recommendations': recommendations,
            'algorithm_used': algorithm,
            'total_recommendations': len(recommendations)
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter recomendações: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/recommendations/users', methods=['POST'])
@limiter.limit("10 per minute")
@require_api_key
def get_user_recommendations():
    """
    Obter recomendações de usuários para conectar
    
    Body:
    {
        "user_id": "string",
        "limit": int (opcional, default: 10),
        "filters": {
            "role": "student" | "professor" (opcional),
            "skills": ["skill1", "skill2"] (opcional),
            "interests": ["interest1", "interest2"] (opcional)
        }
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        limit = data.get('limit', 10)
        filters = data.get('filters', {})
        
        if not user_id:
            return jsonify({'error': 'user_id é obrigatório'}), 400
        
        recommendations = recommendation_service.get_user_recommendations(
            user_id=user_id,
            limit=limit,
            filters=filters
        )
        
        return jsonify({
            'user_id': user_id,
            'recommendations': recommendations,
            'filters_applied': filters,
            'total_recommendations': len(recommendations)
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter recomendações de usuários: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/network/graph-data', methods=['POST'])
@limiter.limit("5 per minute")
@require_api_key
def get_network_graph_data():
    """
    Obter dados do grafo de rede acadêmica
    
    Body:
    {
        "center_user_id": "string" (opcional),
        "max_nodes": int (opcional, default: 100),
        "include_projects": bool (opcional, default: true),
        "include_laboratories": bool (opcional, default: true),
        "max_depth": int (opcional, default: 2)
    }
    """
    try:
        data = request.get_json()
        center_user_id = data.get('center_user_id')
        max_nodes = data.get('max_nodes', 100)
        include_projects = data.get('include_projects', True)
        include_laboratories = data.get('include_laboratories', True)
        max_depth = data.get('max_depth', 2)
        
        graph_data = network_service.get_network_graph(
            center_user_id=center_user_id,
            max_nodes=max_nodes,
            include_projects=include_projects,
            include_laboratories=include_laboratories,
            max_depth=max_depth
        )
        
        return jsonify({
            'nodes': graph_data['nodes'],
            'edges': graph_data['edges'],
            'statistics': graph_data['statistics'],
            'center_user_id': center_user_id
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter dados do grafo: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/network/centrality', methods=['POST'])
@limiter.limit("5 per minute")
@require_api_key
def get_network_centrality():
    """
    Calcular métricas de centralidade da rede
    
    Body:
    {
        "metric": "degree" | "betweenness" | "closeness" | "eigenvector",
        "limit": int (opcional, default: 20)
    }
    """
    try:
        data = request.get_json()
        metric = data.get('metric', 'degree')
        limit = data.get('limit', 20)
        
        if metric not in ['degree', 'betweenness', 'closeness', 'eigenvector']:
            return jsonify({'error': 'Métrica inválida'}), 400
        
        centrality_data = network_service.calculate_centrality(
            metric=metric,
            limit=limit
        )
        
        return jsonify({
            'metric': metric,
            'results': centrality_data,
            'description': network_service.get_metric_description(metric)
        })
        
    except Exception as e:
        logger.error(f"Erro ao calcular centralidade: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/text-analysis/similarity', methods=['POST'])
@limiter.limit("20 per minute")
@require_api_key
def calculate_text_similarity():
    """
    Calcular similaridade entre dois textos
    
    Body:
    {
        "text1": "string",
        "text2": "string",
        "method": "tfidf" | "word2vec" | "bert" (opcional, default: tfidf)
    }
    """
    try:
        data = request.get_json()
        text1 = data.get('text1')
        text2 = data.get('text2')
        method = data.get('method', 'tfidf')
        
        if not text1 or not text2:
            return jsonify({'error': 'text1 e text2 são obrigatórios'}), 400
        
        similarity_score = text_service.calculate_similarity(
            text1=text1,
            text2=text2,
            method=method
        )
        
        return jsonify({
            'similarity_score': similarity_score,
            'method_used': method,
            'interpretation': text_service.interpret_similarity(similarity_score)
        })
        
    except Exception as e:
        logger.error(f"Erro ao calcular similaridade: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/text-analysis/keywords', methods=['POST'])
@limiter.limit("15 per minute")
@require_api_key
def extract_keywords():
    """
    Extrair palavras-chave de um texto
    
    Body:
    {
        "text": "string",
        "max_keywords": int (opcional, default: 10),
        "method": "tfidf" | "textrank" (opcional, default: tfidf)
    }
    """
    try:
        data = request.get_json()
        text = data.get('text')
        max_keywords = data.get('max_keywords', 10)
        method = data.get('method', 'tfidf')
        
        if not text:
            return jsonify({'error': 'text é obrigatório'}), 400
        
        keywords = text_service.extract_keywords(
            text=text,
            max_keywords=max_keywords,
            method=method
        )
        
        return jsonify({
            'keywords': keywords,
            'method_used': method,
            'total_keywords': len(keywords)
        })
        
    except Exception as e:
        logger.error(f"Erro ao extrair palavras-chave: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/analytics/project-trends', methods=['GET'])
@limiter.limit("10 per minute")
@require_api_key
def get_project_trends():
    """
    Obter tendências de projetos e tecnologias
    """
    try:
        trends = recommendation_service.analyze_project_trends()
        
        return jsonify({
            'trending_technologies': trends['technologies'],
            'trending_topics': trends['topics'],
            'growth_areas': trends['growth_areas'],
            'analysis_date': trends['analysis_date']
        })
        
    except Exception as e:
        logger.error(f"Erro ao analisar tendências: {str(e)}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint não encontrado'}), 404

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'error': 'Limite de requisições excedido', 'retry_after': str(e.retry_after)}), 429

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
