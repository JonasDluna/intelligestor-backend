from openai import OpenAI
from app.config.settings import OPENAI_API_KEY, OPENAI_MODEL

client = OpenAI(api_key=OPENAI_API_KEY)


def chamar_ia(messages: list, model: str | None = None) -> str:
    modelo = model or OPENAI_MODEL
    response = client.chat.completions.create(
        model=modelo,
        messages=messages,
    )
    return response.choices[0].message.content
