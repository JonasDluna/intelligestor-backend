#!/usr/bin/env python3
"""
Simple test script to verify the FastAPI backend is working
"""
import httpx
import asyncio
import sys


async def test_endpoints():
    """Test basic endpoints"""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        try:
            # Test root endpoint
            print("Testing root endpoint...")
            response = await client.get(f"{base_url}/")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "running"
            print("✓ Root endpoint working")
            
            # Test health endpoint
            print("\nTesting health endpoint...")
            response = await client.get(f"{base_url}/health")
            assert response.status_code == 200
            assert response.json()["status"] == "healthy"
            print("✓ Health endpoint working")
            
            # Test OpenAPI docs
            print("\nTesting OpenAPI documentation...")
            response = await client.get(f"{base_url}/openapi.json")
            assert response.status_code == 200
            openapi_spec = response.json()
            print(f"✓ OpenAPI docs available with {len(openapi_spec.get('paths', {}))} endpoints")
            
            # Test products endpoint (without database)
            print("\nTesting products endpoint...")
            response = await client.get(f"{base_url}/api/v1/products/")
            # Will return 503 without Supabase configured, which is expected
            print(f"  Products endpoint status: {response.status_code}")
            
            # Test Mercado Livre categories endpoint
            print("\nTesting Mercado Livre categories endpoint...")
            try:
                response = await client.get(f"{base_url}/api/v1/mercadolivre/categories")
                if response.status_code == 200:
                    categories = response.json()
                    print(f"✓ Mercado Livre categories endpoint working, found {len(categories)} categories")
                else:
                    print(f"  Mercado Livre endpoint status: {response.status_code}")
            except Exception as e:
                print(f"  Mercado Livre endpoint error (expected without API credentials): {type(e).__name__}")
            
            print("\n" + "="*50)
            print("✓ All core endpoints are functional!")
            print("="*50)
            
        except Exception as e:
            print(f"\n✗ Error testing endpoints: {e}")
            sys.exit(1)


if __name__ == "__main__":
    print("IntelliGestor Backend - Endpoint Tests")
    print("="*50)
    print("\nMake sure the server is running on http://localhost:8000")
    print("Start it with: python main.py\n")
    
    try:
        asyncio.run(test_endpoints())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\nFailed to run tests: {e}")
        sys.exit(1)
