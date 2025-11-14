# Contributing to IntelliGestor Backend

Thank you for your interest in contributing to IntelliGestor Backend!

## Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/intelligestor-backend.git
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

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

## Project Structure

```
/app
    /routers       # API endpoint definitions
    /services      # Business logic and external API clients
    /models        # Pydantic data models
    /utils         # Utility functions and configuration
main.py            # Application entry point
```

## Development Guidelines

### Code Style

- Follow PEP 8 guidelines
- Use type hints where possible
- Write descriptive docstrings for functions and classes
- Keep functions small and focused

### Adding New Features

1. **Create a new branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **For new API endpoints:**
   - Add route handler in appropriate router file in `/app/routers/`
   - Add data models in `/app/models/`
   - Add business logic in `/app/services/`

3. **For new integrations:**
   - Create a service file in `/app/services/`
   - Add configuration variables in `/app/utils/config.py`
   - Update `.env.example` with new variables

4. **Commit your changes:**
```bash
git add .
git commit -m "Add: descriptive commit message"
```

5. **Push and create a pull request:**
```bash
git push origin feature/your-feature-name
```

## Testing

Run the test script to verify endpoints:
```bash
# Start the server in one terminal
python main.py

# In another terminal, run tests
python test_api.py
```

## Environment Variables

Always add new environment variables to both:
- `/app/utils/config.py` (Settings class)
- `.env.example` (with placeholder values)

## API Documentation

- FastAPI automatically generates documentation
- Access it at `/docs` (Swagger UI) or `/redoc` (ReDoc)
- Ensure all endpoints have proper docstrings and response models

## Pull Request Process

1. Update the README.md if needed
2. Ensure your code follows the project structure
3. Test your changes thoroughly
4. Create a clear and descriptive pull request

## Questions?

Feel free to open an issue for any questions or concerns!
