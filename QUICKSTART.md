# Quick Start Guide

## Prerequisites
- Python 3.8 or higher
- pip package manager

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/JonasDluna/intelligestor-backend.git
cd intelligestor-backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env and add your credentials:
# - SUPABASE_URL and SUPABASE_KEY
# - MERCADOLIVRE_CLIENT_ID and MERCADOLIVRE_CLIENT_SECRET
# - OPENAI_API_KEY
```

### 5. Start the Server
```bash
python main.py
```

The server will start at `http://localhost:8000`

## Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Test the API

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test root endpoint
curl http://localhost:8000/

# Run comprehensive tests
python test_api.py
```

## Using Docker

### Build and Run
```bash
docker-compose up
```

### Access the API
The API will be available at http://localhost:8000

## API Endpoints Overview

### Products
- `GET /api/v1/products/` - List products
- `POST /api/v1/products/` - Create product
- `GET /api/v1/products/{id}` - Get product
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product

### Mercado Livre
- `POST /api/v1/mercadolivre/search` - Search products
- `GET /api/v1/mercadolivre/categories` - List categories
- `GET /api/v1/mercadolivre/products/{id}` - Get product details

### AI (OpenAI)
- `POST /api/v1/ai/completion` - Generate text
- `POST /api/v1/ai/analyze-product` - Analyze product
- `POST /api/v1/ai/generate-description` - Generate description
- `POST /api/v1/ai/suggest-keywords` - Suggest keywords

## Environment Variables

### Required
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key
```

### Optional
```env
MERCADOLIVRE_CLIENT_ID=your-client-id
MERCADOLIVRE_CLIENT_SECRET=your-client-secret
MERCADOLIVRE_REDIRECT_URI=http://localhost:8000/callback
```

## Troubleshooting

### Import Errors
Make sure you're in the virtual environment:
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Port Already in Use
Change the port in `.env`:
```env
PORT=8001
```

### Missing Environment Variables
Copy and configure `.env`:
```bash
cp .env.example .env
# Edit .env with your credentials
```

## Next Steps

1. Read the full [README.md](README.md)
2. Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
3. Explore the API documentation at `/docs`
4. Start building your features!

## Support

For issues or questions, please open an issue on GitHub.
