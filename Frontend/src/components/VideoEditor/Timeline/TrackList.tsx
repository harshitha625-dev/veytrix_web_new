import React from 'react';
import { useTimelineStore } from './store';
import { Track } from './Track';
import { Playhead } from './Playhead';

export const TrackList: React.FC = () => {
  const tracks = useTimelineStore((state) => state.tracks);
  
  // Sort tracks by order
  const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);

  return (
    <div className="relative min-h-full">
      {/* Container for playhead which spans all tracks */}
      <Playhead />
      
      <div className="flex flex-col relative z-20">
        {sortedTracks.map((track, index) => (
          <Track key={track.id} track={track} index={index} />
        ))}
      </div>
    </div>
  );
};
