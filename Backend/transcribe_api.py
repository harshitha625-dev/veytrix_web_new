import os
import json
import logging
import tempfile
import time
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from google import genai
from google.genai import types

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form("en"),
    detect_speakers: bool = Form(False)
):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    client = genai.Client(api_key=api_key)

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
    except Exception as e:
        logger.error(f"Error saving temp file: {e}")
        raise HTTPException(status_code=500, detail="Error processing uploaded file")

    gemini_file = None
    try:
        gemini_file = client.files.upload(file=tmp_path)
        logger.info(f"Uploaded file to Gemini: {gemini_file.name}")

        while gemini_file.state.name == "PROCESSING":
            time.sleep(2)
            gemini_file = client.files.get(name=gemini_file.name)
            
        if gemini_file.state.name == "FAILED":
            raise HTTPException(status_code=500, detail="Gemini file processing failed")

        speaker_instruction = " Detect multiple speakers and prefix their text with 'Speaker X: '." if detect_speakers else ""
        prompt = (
            f"You are a professional video captioner. Transcribe the spoken audio in this file into language code '{language}'. "
            f"Return a JSON array of objects, each containing exactly three keys: "
            f"'start' (float, in seconds), 'end' (float, in seconds), and 'text' (string). "
            f"Break the captions into natural phrases of 2-7 words.{speaker_instruction} "
            f"Ensure the output is strictly a valid JSON array."
        )

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[gemini_file, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        result_text = response.text
        try:
            captions = json.loads(result_text)
            return {"captions": captions}
        except json.JSONDecodeError:
            logger.error(f"Failed to parse Gemini response: {result_text}")
            raise HTTPException(status_code=500, detail="Failed to parse captions from AI response")

    except Exception as e:
        logger.error(f"Error during transcription: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        if gemini_file:
            try:
                client.files.delete(name=gemini_file.name)
            except Exception as e:
                logger.error(f"Error deleting Gemini file: {e}")
