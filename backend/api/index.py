"""
Entry point para Vercel Serverless Functions
"""
import sys
import os

# Adicionar o diretório pai ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

# Vercel espera uma variável chamada 'app' ou 'handler'
handler = app
