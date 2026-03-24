import sys
import json
import os
import mimetypes

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)
    
    # Check file extension
    valid_extensions = ['.mp4', '.mov', '.mkv', '.mp3', '.wav', '.m4a', '.webm', '.avi', '.flac', '.ogg', '.aac', '.wmv']
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext not in valid_extensions:
        print(json.dumps({
            "error": f"Unsupported file type: {ext}. Please upload a video or audio file. Supported formats: MP4, MOV, MKV, MP3, WAV, M4A, WEBM, AVI, FLAC, OGG"
        }))
        sys.exit(1)
    
    # Check MIME type
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type and not mime_type.startswith(('video/', 'audio/')):
        print(json.dumps({
            "error": f"Invalid file type: {mime_type}. Please upload a video or audio file."
        }))
        sys.exit(1)
    
    try:
        import whisper
        
        print(json.dumps({"progress": "Loading Whisper model (this may take a moment)..."}), flush=True)
        model = whisper.load_model("base")
        
        print(json.dumps({"progress": "Transcribing audio..."}), flush=True)
        result = model.transcribe(file_path, word_timestamps=True)
        
        segments = []
        
        for segment in result["segments"]:
            seg_data = {
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"].strip()
            }
            
            if "words" in segment:
                seg_data["words"] = []
                for word in segment["words"]:
                    word_data = {
                        "word": word["word"].strip(),
                        "start": word["start"],
                        "end": word["end"],
                        "probability": word.get("probability", 1.0)
                    }
                    seg_data["words"].append(word_data)
            
            segments.append(seg_data)
        
        output = {
            "segments": segments,
            "text": result["text"],
            "duration": result["segments"][-1]["end"] if result["segments"] else 0
        }
        
        print(json.dumps(output), flush=True)
        
    except ImportError:
        print(json.dumps({"error": "Whisper is not installed. Please run: pip install openai-whisper"}), flush=True)
        sys.exit(1)
    except Exception as e:
        error_msg = str(e)
        if "image" in error_msg.lower():
            error_msg = "This file cannot be processed. Please upload a video or audio file (MP4, MOV, MKV, MP3, WAV, M4A, WEBM)"
        print(json.dumps({"error": error_msg}), flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
