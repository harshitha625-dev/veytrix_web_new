import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Music, Play, Pause, Search, Flame, Grid2X2, List, Loader2, Upload, X, FileAudio } from "lucide-react";
import {
  fetchMusicLibrary,
  MusicTrack,
} from "../../../lib/music-library";
import { useMusicContext, SelectedMusic } from "../../context/music-context";

interface MusicLibraryProps {
  videoDuration: number;
  onSelectTrack?: (track: SelectedMusic) => void;
}

// Imported audio file type
interface ImportedAudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: string;
  file: File;
}

export const MusicLibrary: React.FC<MusicLibraryProps> = ({ videoDuration, onSelectTrack }) => {
  const { setSelectedMusic, isPreviewPlaying, setIsPreviewPlaying } = useMusicContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const previewAudioRef = React.useRef<HTMLAudioElement>(null);

  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Imported audio state
  const [importedFiles, setImportedFiles] = useState<ImportedAudioFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Load live tracks from Feed.fm proxy (with fallback)
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetchMusicLibrary(searchQuery).then((loadedTracks) => {
      if (active) {
        setTracks(loadedTracks);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [searchQuery]);

  const genres = useMemo(() => {
    return Array.from(new Set(tracks.map((t) => t.genre))).filter(Boolean);
  }, [tracks]);

  const moods = useMemo(() => {
    return Array.from(new Set(tracks.map((t) => t.mood))).filter(Boolean);
  }, [tracks]);

  // Filter logic
  const filteredTracks = useMemo(() => {
    let list = [...tracks];

    if (selectedGenre) {
      list = list.filter((t) => t.genre === selectedGenre);
    }

    if (selectedMood) {
      list = list.filter((t) => t.mood === selectedMood);
    }

    return list;
  }, [tracks, selectedGenre, selectedMood]);

  const trendingTracks = useMemo(() => {
    return tracks.filter((t) => t.trending);
  }, [tracks]);

  const handleSelectTrack = (track: MusicTrack) => {
    const selectedMusic: SelectedMusic = {
      id: track.id,
      name: track.name,
      artist: track.artist,
      duration: track.duration,
      source: "library",
      url: track.url,
      volume: 80,
      startTime: 0,
      endTime: Math.min(track.duration, videoDuration),
      muteOriginal: false,
    };

    setSelectedMusic(selectedMusic);
    onSelectTrack?.(selectedMusic);
  };

  // ── Import Audio helpers ──────────────────────────────────
  const getAudioDuration = (file: File): Promise<number> =>
    new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.onloadedmetadata = () => { resolve(audio.duration || 0); URL.revokeObjectURL(audio.src); };
      audio.onerror = () => { resolve(0); URL.revokeObjectURL(audio.src); };
      audio.src = URL.createObjectURL(file);
    });

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processImportedFiles = async (files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter((f) =>
      f.type.startsWith("audio/") || /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(f.name)
    );
    const processed = await Promise.all(
      audioFiles.map(async (file) => {
        const url = URL.createObjectURL(file);
        const duration = await getAudioDuration(file);
        return {
          id: Math.random().toString(36).slice(2, 11),
          name: file.name.replace(/\.[^/.]+$/, ""),
          url,
          duration,
          size: formatBytes(file.size),
          file,
        } as ImportedAudioFile;
      })
    );
    setImportedFiles((prev) => [...prev, ...processed]);
  };

  const handleImportInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processImportedFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) processImportedFiles(e.dataTransfer.files);
  };

  const removeImportedFile = (id: string) => {
    setImportedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSelectImported = (file: ImportedAudioFile) => {
    const selectedMusic: SelectedMusic = {
      id: file.id,
      name: file.name,
      artist: "Imported",
      duration: file.duration,
      source: "upload" as any,
      url: file.url,
      volume: 80,
      startTime: 0,
      endTime: Math.min(file.duration, videoDuration),
      muteOriginal: false,
    };
    setSelectedMusic(selectedMusic);
    onSelectTrack?.(selectedMusic);
  };

  const handlePreviewImported = (file: ImportedAudioFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingTrackId === file.id && isPreviewPlaying) {
      previewAudioRef.current?.pause();
      setIsPreviewPlaying(false);
      setPlayingTrackId(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.src = file.url;
        previewAudioRef.current.play();
        setIsPreviewPlaying(true);
        setPlayingTrackId(file.id);
      }
    }
  };

  const handlePlayPreview = (track: MusicTrack, e: React.MouseEvent) => {
    e.stopPropagation();

    if (playingTrackId === track.id && isPreviewPlaying) {
      // Stop playing
      previewAudioRef.current?.pause();
      setIsPreviewPlaying(false);
      setPlayingTrackId(null);
    } else {
      // Start playing
      if (previewAudioRef.current) {
        previewAudioRef.current.src = track.url;
        previewAudioRef.current.play();
        setIsPreviewPlaying(true);
        setPlayingTrackId(track.id);
      }
    }
  };

  const TrackCard = ({ track }: { track: MusicTrack }) => (
    <div
      onClick={() => handleSelectTrack(track)}
      className="group bg-[#0f1724] border border-white/5 rounded-lg p-3 cursor-pointer hover:border-purple-400/30 transition-all hover:bg-[#0f1724]/80 space-y-2"
    >
      {/* Track Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate text-white group-hover:text-purple-400 transition">
            {track.name}
          </h4>
          <p className="text-xs text-white/60 truncate">{track.artist}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => handlePlayPreview(track, e)}
          className="h-8 w-8 p-0"
        >
          {playingTrackId === track.id && isPreviewPlaying ? (
            <Pause className="w-4 h-4 text-purple-400" />
          ) : (
            <Play className="w-4 h-4 text-white/60 group-hover:text-purple-400" />
          )}
        </Button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-300">
          {track.genre}
        </Badge>
        <Badge variant="outline" className="text-xs bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300">
          {track.mood}
        </Badge>
        {track.bpm && (
          <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-300">
            {track.bpm} BPM
          </Badge>
        )}
        {track.trending && (
          <Badge className="text-xs bg-red-500/20 border-red-500/50 text-red-300 flex items-center gap-1">
            <Flame className="w-3 h-3" /> Trending
          </Badge>
        )}
      </div>

      {/* Duration */}
      <div className="text-xs text-white/50">
        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
      </div>
    </div>
  );

  const TrackListItem = ({ track }: { track: MusicTrack }) => (
    <div
      onClick={() => handleSelectTrack(track)}
      className="group bg-[#0f1724] border border-white/5 rounded-lg p-3 cursor-pointer hover:border-purple-400/30 transition-all flex items-center justify-between"
    >
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-purple-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">{track.name}</h4>
          <div className="flex items-center gap-2">
            <p className="text-xs text-white/60 truncate">{track.artist}</p>
            <span className="text-xs text-white/40">•</span>
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-300">
              {track.genre}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-white/60">
          {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => handlePlayPreview(track, e)}
          className="h-8 w-8 p-0"
        >
          {playingTrackId === track.id && isPreviewPlaying ? (
            <Pause className="w-4 h-4 text-purple-400" />
          ) : (
            <Play className="w-4 h-4 text-white/60" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Hidden Audio Element for Previews */}
      <audio ref={previewAudioRef} onEnded={() => setPlayingTrackId(null)} />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          placeholder="Search by song, artist, genre, mood..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[#061018] border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid2X2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className="h-8 w-8 p-0"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        <span className="text-xs text-white/60">{filteredTracks.length} tracks</span>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {/* Genre Filter */}
        {genres.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/80">Genre</label>
            <ScrollArea className="w-full">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedGenre === null ? "default" : "outline"}
                  onClick={() => setSelectedGenre(null)}
                  className="text-xs"
                >
                  All
                </Button>
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    size="sm"
                    variant={selectedGenre === genre ? "default" : "outline"}
                    onClick={() => setSelectedGenre(genre)}
                    className="text-xs"
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Mood Filter */}
        {moods.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/80">Mood</label>
            <ScrollArea className="w-full">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedMood === null ? "default" : "outline"}
                  onClick={() => setSelectedMood(null)}
                  className="text-xs"
                >
                  All
                </Button>
                {moods.map((mood) => (
                  <Button
                    key={mood}
                    size="sm"
                    variant={selectedMood === mood ? "default" : "outline"}
                    onClick={() => setSelectedMood(mood)}
                    className="text-xs"
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex-1 flex items-center gap-1">
            <Flame className="w-3 h-3" /> Trending
          </TabsTrigger>
          <TabsTrigger value="import" className="flex-1 flex items-center gap-1">
            <Upload className="w-3 h-3" /> Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          <ScrollArea className="h-[400px] w-full">
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2 pr-4" : "space-y-2 pr-4"}>
              {isLoading ? (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-white/50 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-xs uppercase tracking-wider font-bold">Syncing tracks...</span>
                </div>
              ) : filteredTracks.length > 0 ? (
                filteredTracks.map((track) =>
                  viewMode === "grid" ? (
                    <TrackCard key={track.id} track={track} />
                  ) : (
                    <TrackListItem key={track.id} track={track} />
                  )
                )
              ) : (
                <div className="col-span-full py-8 text-center text-white/60">
                  No tracks found. Try adjusting your filters.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trending" className="space-y-3">
          <ScrollArea className="h-[400px] w-full">
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2 pr-4" : "space-y-2 pr-4"}>
              {isLoading ? (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-white/50 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-xs uppercase tracking-wider font-bold">Syncing tracks...</span>
                </div>
              ) : trendingTracks.length > 0 ? (
                trendingTracks.map((track) =>
                  viewMode === "grid" ? (
                    <TrackCard key={track.id} track={track} />
                  ) : (
                    <TrackListItem key={track.id} track={track} />
                  )
                )
              ) : (
                <div className="col-span-full py-8 text-center text-white/60">
                  No trending tracks available.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── Import Audio Tab ── */}
        <TabsContent value="import" className="space-y-3 mt-3">
          {/* Hidden file input */}
          <input
            ref={importInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.aac,.flac,.m4a"
            multiple
            className="hidden"
            onChange={handleImportInputChange}
          />

          {/* Drag-and-drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => importInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all ${
              isDragOver
                ? "border-purple-400 bg-purple-500/10"
                : "border-white/10 hover:border-purple-400/40 hover:bg-white/[0.02]"
            }`}
          >
            <div className={`p-4 rounded-full transition-colors ${
              isDragOver ? "bg-purple-500/20" : "bg-white/5"
            }`}>
              <Upload className={`w-7 h-7 transition-colors ${
                isDragOver ? "text-purple-400" : "text-white/40"
              }`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white/80">Drop audio files here</p>
              <p className="text-xs text-white/40 mt-1">or click to browse</p>
              <p className="text-[10px] text-white/30 mt-2 uppercase tracking-wider font-bold">
                MP3 · WAV · OGG · AAC · FLAC · M4A
              </p>
            </div>
          </div>

          {/* Browse button */}
          <Button
            variant="outline"
            className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 text-xs font-bold uppercase tracking-wider gap-2"
            onClick={() => importInputRef.current?.click()}
          >
            <FileAudio className="w-4 h-4" />
            Browse Audio Files
          </Button>

          {/* Imported files list */}
          {importedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  Imported ({importedFiles.length})
                </span>
                <button
                  onClick={() => {
                    importedFiles.forEach((f) => URL.revokeObjectURL(f.url));
                    setImportedFiles([]);
                  }}
                  className="text-[10px] text-white/40 hover:text-red-400 transition uppercase tracking-wider font-bold"
                >
                  Clear all
                </button>
              </div>

              <ScrollArea className="max-h-[280px] w-full">
                <div className="space-y-2 pr-2">
                  {importedFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleSelectImported(file)}
                      className="group flex items-center gap-3 rounded-lg border border-white/5 bg-[#0f1724] p-3 cursor-pointer hover:border-purple-400/30 hover:bg-[#0f1724]/80 transition-all"
                    >
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <FileAudio className="w-4 h-4 text-purple-400" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-white/40">
                            {file.duration > 0
                              ? `${Math.floor(file.duration / 60)}:${Math.floor(file.duration % 60).toString().padStart(2, "0")}`
                              : "--:--"}
                          </span>
                          <span className="text-[10px] text-white/30">·</span>
                          <span className="text-[10px] text-white/40">{file.size}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handlePreviewImported(file, e)}
                          className="h-7 w-7 p-0"
                        >
                          {playingTrackId === file.id && isPreviewPlaying ? (
                            <Pause className="w-3.5 h-3.5 text-purple-400" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-white/50 group-hover:text-purple-400" />
                          )}
                        </Button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeImportedFile(file.id); }}
                          className="p-1 rounded hover:bg-red-500/20 text-white/30 hover:text-red-400 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
