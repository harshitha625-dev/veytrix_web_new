import re

def main():
    hub_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\components\TimelineHub.tsx'
    with open(hub_path, 'r', encoding='utf-8') as f:
        hub = f.read()

    # 1. Add Crop to lucide-react imports
    if 'Crop' not in hub[:1500]:
        hub = re.sub(r'Undo2, Redo2, SkipBack, SkipForward, Pencil, FileAudio', 'Undo2, Redo2, SkipBack, SkipForward, Pencil, FileAudio, Crop', hub, count=1)

    # 2. Add onCropTrack to props
    hub = hub.replace('}: any) => {', '  onCropTrack,\n}: any) => {')

    # 3. Add TrackBtn for Crop
    crop_btn = """                    <TrackBtn onClick={(e) => { e.stopPropagation(); if(onCropTrack) onCropTrack(track.id); }} title="Crop Track">
                      <Crop className="w-3 h-3 text-slate-400" />
                    </TrackBtn>
"""
    hub = hub.replace(
        '<TrackBtn onClick={(e) => { e.stopPropagation(); toggleHide(track.id); }} title={track.isHidden ? "Show Track" : "Hide Track"}>',
        crop_btn + '                    <TrackBtn onClick={(e) => { e.stopPropagation(); toggleHide(track.id); }} title={track.isHidden ? "Show Track" : "Hide Track"}>'
    )

    with open(hub_path, 'w', encoding='utf-8') as f:
        f.write(hub)

    style_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(style_path, 'r', encoding='utf-8') as f:
        style = f.read()

    # 4. Pass onCropTrack to TimelineHub
    # In style-screen.tsx, find `<TimelineHub` and add `onCropTrack` handler
    
    on_crop = """<TimelineHub
                            onCropTrack={(trackId) => { 
                                const firstItem = mediaItems.find((m: any) => m.trackId === trackId) || libraryAssets.find((m: any) => m.trackId === trackId);
                                if (firstItem) setActivePreviewId(firstItem.id);
                                setIsCropMode(true); 
                            }}"""
                            
    style = style.replace('<TimelineHub', on_crop, 1) # Replace only the first instance if there are multiple, but usually there's one
    
    with open(style_path, 'w', encoding='utf-8') as f:
        f.write(style)
        
    print("Modifications successful")

if __name__ == '__main__':
    main()
