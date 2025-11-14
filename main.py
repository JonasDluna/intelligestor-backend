from fastapi import FastAPI

from app.routers.ia_buybox import router as ia_buybox_router
from app.routers.ia_products import router as ia_products_router

app = FastAPI(title="Intelligestor Backend API", version="0.1.0")


@app.get("/")
def health():
    return {"status": "online", "service": "intelligestor-backend"}


# Rotas de IA
app.include_router(ia_buybox_router, prefix="/ia/buybox", tags=["IA - BuyBox"])
app.include_router(ia_products_router, prefix="/ia/produtos", tags=["IA - Produtos"])
