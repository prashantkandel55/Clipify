import sys
import json
import subprocess
import os

def export_video(
    input_path,
    output_path,
    start_time,
    duration,
    captions,
    caption_style='word',
    font_size=20,
    caption_color='#FFFFFF',
    highlight_color='#534AB7',
    caption_position='bottom',
    background_fill='blur',
    fill_color='#000000',
    logo_path='',
    logo_position='top-right',
    logo_opacity=0.8,
    width=1080,
    height=1920,
    intro_enabled=False,
    intro_text='',
    outro_enabled=False,
    outro_text=''
):
    try:
        filters = []
        filter_complex = ''
        
        if background_fill == 'blur':
            filters.append(f'scale={width}:{height}:force_original_aspect_ratio=decrease')
            filters.append(f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:blur=20')
            filters.append(f'drawbox=0:0:{width}:{height}:color={fill_color}@0.5:t=fill')
        elif background_fill == 'color':
            filters.append(f'scale={width}:{height}:force_original_aspect_ratio=decrease')
            filters.append(f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color={fill_color}')
        elif background_fill == 'mirror':
            filters.append(f'scale={width}:{height}:force_original_aspect_ratio=decrease')
            filters.append(f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2')
            filters.append('hflip')
        elif background_fill == 'gradient':
            filters.append(f'scale={width}:{height}:force_original_aspect_ratio=decrease')
            filters.append(f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=gray')
        else:
            filters.append(f'scale={width}:{height}:force_original_aspect_ratio=decrease')
            filters.append(f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2')
        
        filter_complex = ','.join(filters)
        
        if logo_path and os.path.exists(logo_path):
            logo_x = 'w-tw-20' if logo_position in ['top-right', 'bottom-right'] else '20'
            logo_y = '20' if logo_position in ['top-left', 'top-right'] else 'h-th-20'
            filter_complex += f',overlay={logo_x}:{logo_y}'
        
        input_options = [
            '-ss', str(start_time),
            '-i', input_path,
            '-t', str(duration)
        ]
        
        output_options = [
            '-filter_complex', filter_complex,
            '-map', '0:v',
            '-map', '0:a?',
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            '-y',
            output_path
        ]
        
        cmd = ['ffmpeg'] + input_options + output_options
        
        print("Starting export...", flush=True)
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        
        print(json.dumps({"success": True, "outputPath": output_path}), flush=True)
        
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr if e.stderr else str(e)
        print(f"FFmpeg error: {error_msg}", flush=True)
        print(json.dumps({"error": error_msg}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

def main():
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Insufficient arguments"}))
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    start_time = float(sys.argv[3])
    duration = float(sys.argv[4])
    
    caption_style = sys.argv[5] if len(sys.argv) > 5 else 'word'
    font_size = int(sys.argv[6]) if len(sys.argv) > 6 else 20
    caption_color = sys.argv[7] if len(sys.argv) > 7 else '#FFFFFF'
    highlight_color = sys.argv[8] if len(sys.argv) > 8 else '#534AB7'
    caption_position = sys.argv[9] if len(sys.argv) > 9 else 'bottom'
    background_fill = sys.argv[10] if len(sys.argv) > 10 else 'blur'
    fill_color = sys.argv[11] if len(sys.argv) > 11 else '#000000'
    logo_path = sys.argv[12] if len(sys.argv) > 12 else ''
    logo_position = sys.argv[13] if len(sys.argv) > 13 else 'top-right'
    logo_opacity = float(sys.argv[14]) if len(sys.argv) > 14 else 0.8
    width = int(sys.argv[15]) if len(sys.argv) > 15 else 1080
    height = int(sys.argv[16]) if len(sys.argv) > 16 else 1920
    intro_enabled = sys.argv[17].lower() == 'true' if len(sys.argv) > 17 else False
    intro_text = sys.argv[18] if len(sys.argv) > 18 else ''
    outro_enabled = sys.argv[19].lower() == 'true' if len(sys.argv) > 19 else False
    outro_text = sys.argv[20] if len(sys.argv) > 20 else ''
    
    captions = []
    
    export_video(
        input_path,
        output_path,
        start_time,
        duration,
        captions,
        caption_style,
        font_size,
        caption_color,
        highlight_color,
        caption_position,
        background_fill,
        fill_color,
        logo_path,
        logo_position,
        logo_opacity,
        width,
        height,
        intro_enabled,
        intro_text,
        outro_enabled,
        outro_text
    )

if __name__ == "__main__":
    main()
