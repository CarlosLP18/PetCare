from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    app_env: str = "development"
    cors_origins: list[str] = ["http://localhost:3000"]

    # GenLayer blockchain
    genlayer_node_url: str = "http://localhost:4000/api"
    genlayer_contract_address: str = ""
    genlayer_sender_address: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
