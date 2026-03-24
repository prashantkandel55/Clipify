import sys
import json
import re

EMOTIONAL_WORDS = {
    "amazing", "incredible", "unbelievable", "fantastic", "wonderful", "excellent",
    "awesome", "incredibly", "totally", "completely", "absolutely", "extremely",
    "really", "seriously", "literally", "actually", "definitely", "obviously",
    "clearly", "thank", "thanks", "appreciate", "love", "like",
    "hate", "fear", "worst", "best", "great", "good", "bad", "wrong", "right",
    "important", "essential", "crucial", "critical", "significant", "major",
    "imagine", "believe", "think", "know", "remember", "forget", "notice",
    "realize", "understand", "hear", "listen", "watch", "look", "see", "feel",
    "want", "need", "hope", "wish", "dream", "try", "do", "make", "create",
    "start", "stop", "begin", "end", "finish", "complete", "succeed", "fail",
    "win", "lose", "gain", "achieve", "accomplish", "prove", "show", "demonstrate",
    "explain", "describe", "tell", "share", "give", "take", "get", "become",
    "secret", "truth", "changed", "discovered", "honestly", "insane", "crazy", "huge", "massive"
}

QUESTION_STARTERS = {"what", "why", "how", "when", "where", "who", "which", "is", "are", "do", "does", "can", "could", "would", "will", "should", "if"}

def calculate_word_density(text):
    words = re.findall(r'\b\w+\b', text.lower())
    if not words:
        return 0
    
    emotional_count = sum(1 for w in words if w in EMOTIONAL_WORDS)
    return emotional_count / len(words)

def detect_questions(text):
    sentences = re.split(r'[.!?]+', text)
    question_count = sum(1 for s in sentences if '?' in s)
    return question_count / max(len(sentences), 1)

def detect_exclamations(text):
    exclaim_count = len(re.findall(r'!', text))
    sentences = len(re.split(r'[.!?]+', text))
    return exclaim_count / max(sentences, 1)

def analyze_segment(segment):
    text = segment.get("text", "")
    start = segment.get("start", 0)
    end = segment.get("end", 0)
    
    word_density = calculate_word_density(text)
    question_score = detect_questions(text)
    exclamation_score = detect_exclamations(text)
    
    has_question = "?" in text
    has_exclamation = "!" in text
    
    strong_claims = [
        r'\b(you should|must|need to|have to|got to|will|definitely|certainly|absolutely)\b',
        r'\b(this is|that is|here is|here\'s|there\'s|it\'s)\b.*\b(real|truly|really)\b',
        r'\b(guarantee|promise|trust me|believe me|honestly)\b'
    ]
    
    claim_count = sum(len(re.findall(pattern, text.lower())) for pattern in strong_claims)
    
    base_score = (
        word_density * 40 +
        question_score * 15 +
        exclamation_score * 20 +
        claim_count * 15
    )
    
    clip_score = min(100, max(30, int(base_score * 10)))
    
    words = text.lower().split()
    keywords = [w for w in words if w in EMOTIONAL_WORDS][:5]
    
    return {
        "start": start,
        "end": end,
        "duration": round(end - start, 1),
        "text": text,
        "title": " ".join(text.split()[:6]) + ("..." if len(text.split()) > 6 else ""),
        "description": text[:100] + "..." if len(text) > 100 else text,
        "score": clip_score,
        "keywords": keywords,
        "hasQuestion": has_question,
        "hasExclamation": has_exclamation
    }

def detect_clips(transcript_data):
    try:
        segments = transcript_data.get("segments", [])
        
        if not segments:
            print(json.dumps({"error": "No segments in transcription"}))
            sys.exit(1)
        
        clip_candidates = []
        
        MIN_CLIP_DURATION = 15
        MAX_CLIP_DURATION = 60
        
        for segment in segments:
            clip = analyze_segment(segment)
            
            if MIN_CLIP_DURATION <= clip["duration"] <= MAX_CLIP_DURATION:
                clip_candidates.append(clip)
        
        if len(clip_candidates) < 3:
            for i in range(len(segments) - 1):
                combined = {
                    "text": segments[i]["text"] + " " + segments[i + 1]["text"],
                    "start": segments[i]["start"],
                    "end": segments[i + 1]["end"]
                }
                clip = analyze_segment(combined)
                if clip["duration"] >= MIN_CLIP_DURATION:
                    clip_candidates.append(clip)
        
        clip_candidates.sort(key=lambda x: x["score"], reverse=True)
        
        selected_clips = []
        min_gap = 3
        
        for clip in clip_candidates:
            overlap = False
            for selected in selected_clips:
                if not (clip["end"] <= selected["start"] + min_gap or 
                        clip["start"] >= selected["end"] + min_gap):
                    overlap = True
                    break
            
            if not overlap:
                selected_clips.append(clip)
        
        selected_clips.sort(key=lambda x: x["start"])
        
        print(json.dumps(selected_clips))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

def main():
    try:
        input_data = sys.stdin.read()
        transcript_data = json.loads(input_data)
        detect_clips(transcript_data)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
