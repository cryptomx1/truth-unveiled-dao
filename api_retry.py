import time
import random
import os
import argparse
import sqlite3
from datetime import datetime
from dotenv import load_dotenv
from xai_sdk import Client as XAIClient
from openai import OpenAI
import PyPDF2

parser = argparse.ArgumentParser(description="CLI Chatbot with xAI/OpenAI APIs")
parser.add_argument("--prompt", help="Prompt to send to the API")
parser.add_argument("--pdf", help="Path to PDF file to summarize")
parser.add_argument("--model", default="grok-3-mini", help="Model (e.g., grok-3-mini, gpt-4o-mini)")
parser.add_argument("--api", choices=["xai", "openai", "both"], default="both", help="Which API to query")
parser.add_argument("--interactive", action="store_true", help="Run in interactive mode")
parser.add_argument("--summarize", action="store_true", help="Summarize input text or PDF")
args = parser.parse_args()

load_dotenv()
xai_api_key = os.getenv("XAI_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize SQLite database
conn = sqlite3.connect("chat_history.db")
cursor = conn.cursor()
cursor.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT,
        is_pdf BOOLEAN,
        xai_response TEXT,
        openai_response TEXT,
        timestamp DATETIME
    )
""")
conn.commit()

def extract_pdf_text(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text.strip()
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

def query_api(client, model, prompt, api_name, max_retries=5, summarize=False):
    system_prompt = "You are a helpful assistant that provides concise answers." if not summarize else "Summarize the following text in 2-3 sentences, capturing the main points."
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            if "503" in str(e) or "temporarily unavailable" in str(e).lower() or "service unavailable" in str(e).lower():
                wait_time = (2 ** attempt) + random.uniform(0, 1)
                print(f"{api_name} 503 Error, retrying in {wait_time:.2f}s...")
                time.sleep(wait_time)
            else:
                print(f"{api_name} Error: {e}")
                return None
    print(f"{api_name} Failed after {max_retries} retries")
    return None

def save_to_db(prompt, is_pdf, xai_response, openai_response):
    cursor.execute(
        "INSERT INTO history (prompt, is_pdf, xai_response, openai_response, timestamp) VALUES (?, ?, ?, ?, ?)",
        (prompt, is_pdf, xai_response, openai_response, datetime.now())
    )
    conn.commit()

def main():
    if args.interactive:
        print("Interactive Chatbot Mode (type 'exit' to quit)")
        while True:
            prompt = input("You: ")
            if prompt.lower() == "exit":
                break
            xai_response, openai_response = None, None
            if args.api in ["xai", "both"] and xai_api_key:
                xai_response = query_api(XAIClient(api_key=xai_api_key), args.model if "grok" in args.model else "grok-3-mini", prompt, "xAI", summarize=args.summarize)
                if xai_response:
                    print(f"xAI: {xai_response}")
            if args.api in ["openai", "both"] and openai_api_key:
                openai_response = query_api(OpenAI(api_key=openai_api_key, base_url="https://api.openai.com/v1"), args.model if "gpt" in args.model else "gpt-4o-mini", prompt, "OpenAI", summarize=args.summarize)
                if openai_response:
                    print(f"OpenAI: {openai_response}")
            save_to_db(prompt, False, xai_response, openai_response)
    else:
        prompt = args.prompt
        is_pdf = False
        if args.pdf:
            prompt = extract_pdf_text(args.pdf)
            is_pdf = True
            if not prompt:
                print("Failed to extract PDF text. Exiting.")
                return
        prompt = prompt or "Hello, world!"
        xai_response, openai_response = None, None
        if args.api in ["xai", "both"] and xai_api_key:
            xai_response = query_api(XAIClient(api_key=xai_api_key), args.model if "grok" in args.model else "grok-3-mini", prompt, "xAI", summarize=args.summarize)
            if xai_response:
                print(f"xAI Response: {xai_response}")
        if args.api in ["openai", "both"] and openai_api_key:
            openai_response = query_api(OpenAI(api_key=openai_api_key, base_url="https://api.openai.com/v1"), args.model if "gpt" in args.model else "gpt-4o-mini", prompt, "OpenAI", summarize=args.summarize)
            if openai_response:
                print(f"OpenAI Response: {openai_response}")
        save_to_db(prompt, is_pdf, xai_response, openai_response)
    conn.close()

if __name__ == "__main__":
    main()