"""
Supabase Database Service
Handles all database operations using Supabase
"""
from supabase import create_client, Client
from typing import Optional, List, Dict, Any
from app.utils.config import settings


class SupabaseService:
    """Service for interacting with Supabase database"""
    
    def __init__(self):
        """Initialize Supabase client"""
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise ValueError("Supabase URL and KEY must be configured")
        
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
    
    async def get_all(self, table: str, filters: Optional[Dict[str, Any]] = None) -> List[Dict]:
        """
        Get all records from a table with optional filters
        
        Args:
            table: Table name
            filters: Optional filters as dict {column: value}
            
        Returns:
            List of records
        """
        try:
            query = self.client.table(table).select("*")
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            response = query.execute()
            return response.data
        except Exception as e:
            raise Exception(f"Error fetching data from {table}: {str(e)}")
    
    async def get_by_id(self, table: str, record_id: str) -> Optional[Dict]:
        """
        Get a single record by ID
        
        Args:
            table: Table name
            record_id: Record ID
            
        Returns:
            Record data or None
        """
        try:
            response = self.client.table(table).select("*").eq("id", record_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error fetching record from {table}: {str(e)}")
    
    async def create(self, table: str, data: Dict[str, Any]) -> Dict:
        """
        Create a new record
        
        Args:
            table: Table name
            data: Record data
            
        Returns:
            Created record
        """
        try:
            response = self.client.table(table).insert(data).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            raise Exception(f"Error creating record in {table}: {str(e)}")
    
    async def update(self, table: str, record_id: str, data: Dict[str, Any]) -> Dict:
        """
        Update a record
        
        Args:
            table: Table name
            record_id: Record ID
            data: Updated data
            
        Returns:
            Updated record
        """
        try:
            response = self.client.table(table).update(data).eq("id", record_id).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            raise Exception(f"Error updating record in {table}: {str(e)}")
    
    async def delete(self, table: str, record_id: str) -> bool:
        """
        Delete a record
        
        Args:
            table: Table name
            record_id: Record ID
            
        Returns:
            True if deleted successfully
        """
        try:
            self.client.table(table).delete().eq("id", record_id).execute()
            return True
        except Exception as e:
            raise Exception(f"Error deleting record from {table}: {str(e)}")


# Singleton instance
supabase_service = SupabaseService() if settings.SUPABASE_URL and settings.SUPABASE_KEY else None
