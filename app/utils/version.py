import subprocess
import os
from typing import Optional

def get_git_commit_hash() -> str:
    """
    Obtém o hash do commit atual do Git.
    Retorna 'unknown' se não conseguir obter.
    """
    try:
        # Tenta obter do ambiente (Render define RENDER_GIT_COMMIT)
        render_commit = os.environ.get('RENDER_GIT_COMMIT')
        if render_commit:
            return render_commit[:7]  # Primeiros 7 caracteres
        
        # Tenta obter via comando git
        result = subprocess.run(
            ['git', 'rev-parse', '--short', 'HEAD'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            return result.stdout.strip()
            
    except Exception:
        pass
    
    return 'unknown'

def get_version_info() -> dict:
    """
    Retorna informações da versão atual
    """
    commit_hash = get_git_commit_hash()
    
    return {
        "version": commit_hash,
        "changes": [
            "Correção sincronização ML",
            "Atualização schema anuncios_ml", 
            "Suporte a pictures[] ao invés de thumbnail",
            "Frontend exibindo dados corretamente",
            "Versão automática via Git"
        ]
    }