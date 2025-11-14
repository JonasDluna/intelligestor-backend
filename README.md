# IntelliGestor Backend

Backend FastAPI do IntelliGestor – integra Mercado Livre, Supabase, OpenAI (GPT-5.1) e automações.

## 🚀 Features

- **FastAPI Framework**: Modern, fast web framework for building APIs
- **Supabase Integration**: PostgreSQL database with real-time capabilities
- **Mercado Livre API**: Integration with Brazil's largest e-commerce platform
- **OpenAI GPT Integration**: AI-powered product analysis and content generation
- **Modular Architecture**: Clean separation of concerns with routers, services, models, and utils

## 📁 Project Structure

```
/app
    /routers          # API endpoints
        - products.py         # Product management endpoints
        - mercadolivre.py     # Mercado Livre API endpoints
        - openai_gpt.py       # AI-powered endpoints
    /services         # Business logic
        - supabase_service.py     # Database operations
        - mercadolivre_service.py # Mercado Livre API client
        - openai_service.py       # OpenAI GPT client
    /models           # Data models
        - product.py          # Product data models
        - mercadolivre.py     # Mercado Livre models
        - openai.py           # OpenAI models
    /utils            # Utilities
        - config.py           # Configuration management
        - logger.py           # Logging utilities
main.py               # Application entry point
requirements.txt      # Python dependencies
.env.example          # Environment variables template
```

## 🛠️ Setup

### Prerequisites

- Python 3.8+
- pip or virtualenv

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JonasDluna/intelligestor-backend.git
cd intelligestor-backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### Environment Variables

Configure the following in your `.env` file:

#### Supabase
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

#### Mercado Livre
- `MERCADOLIVRE_CLIENT_ID`: Your Mercado Livre app client ID
- `MERCADOLIVRE_CLIENT_SECRET`: Your Mercado Livre app secret
- `MERCADOLIVRE_REDIRECT_URI`: OAuth callback URL
- `MERCADOLIVRE_ACCESS_TOKEN`: User access token (obtained via OAuth)

#### OpenAI
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: Model to use (default: gpt-4)

## 🚀 Running the Application

### Development Mode

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Documentation

Once the application is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔌 API Endpoints

### Products
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/{id}` - Get product by ID
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product

### Mercado Livre
- `GET /api/v1/mercadolivre/auth/url` - Get OAuth URL
- `POST /api/v1/mercadolivre/auth/callback` - Handle OAuth callback
- `POST /api/v1/mercadolivre/search` - Search products
- `GET /api/v1/mercadolivre/products/{id}` - Get product details
- `GET /api/v1/mercadolivre/categories` - Get categories
- `GET /api/v1/mercadolivre/users/{id}/items` - Get user items

### AI (OpenAI)
- `POST /api/v1/ai/completion` - Generate text completion
- `POST /api/v1/ai/analyze-product` - Analyze product with AI
- `POST /api/v1/ai/generate-description` - Generate product description
- `POST /api/v1/ai/suggest-keywords` - Suggest SEO keywords

## 🧪 Testing

```bash
# Run tests (when implemented)
pytest
```

## 📝 License

This project is licensed under the terms specified in the LICENSE file.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
