import jwt
import json

# Token JWT
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OWE4MjA3ZS00OGVhLTRjYWEtOWJkMC1hNjJkYWMzZjRiZjMiLCJlbWFpbCI6ImpvbmFzdG9ydG9yZXR0ZUBob3RtYWlsLmNvbSIsImV4cCI6MTczMjMxODgxN30.UvK_o4hN19wiyKfhPld8EMnL1Aret3DT__XLarQGGCfgh6t5HO17dffknIC6pUrVOiy-CGjkTMRKPvEJANm5rQ"

# Decodificar sem verificar assinatura (apenas para extrair dados)
decoded = jwt.decode(token, options={"verify_signature": False})

print("\n" + "="*60)
print("📋 DADOS DO TOKEN JWT")
print("="*60)
print(json.dumps(decoded, indent=2))
print("="*60)
print(f"\n✅ USER_ID: {decoded['sub']}")
print(f"✅ EMAIL: {decoded['email']}")
print("="*60)
